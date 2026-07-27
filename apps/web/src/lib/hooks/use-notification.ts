import { getNotificationStatus, subscribeToNotifications, toggleNotificationStatus } from '@/lib/api-client';
import { NotificationStatus, PushNotification } from '@mintfolio/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useNotification() {
  const queryClient = useQueryClient();
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  const [isCheckingEndpoint, setIsCheckingEndpoint] = useState(true);

  // Step 1 — on mount, read browser permission + get this device's push subscription endpoint
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCheckingEndpoint(false);
      return;
    }

    setPermission(Notification.permission);

    navigator.serviceWorker.ready
      .then((sw) => sw.pushManager.getSubscription())
      .then((sub) => {
        setEndpoint(sub?.endpoint ?? null);
        setIsCheckingEndpoint(false);
      })
      .catch(() => {
        setEndpoint(null);
        setIsCheckingEndpoint(false);
      });
  }, []);

  // Step 2 — query backend for is_active state, only when we have an endpoint
  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['notification-status', endpoint],
    queryFn: () => getNotificationStatus(endpoint!),
    enabled: !!endpoint && permission === 'granted',
    retry: false, // 404 = not subscribed, don't retry
  });

  // Step 3 — derive status
  const status: NotificationStatus = (() => {
    if (typeof window === 'undefined') return 'loading';
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
    if (isCheckingEndpoint || permission === null || (!!endpoint && isStatusLoading)) return 'loading';
    if (permission === 'denied') return 'denied';
    if (!endpoint) return 'unsubscribed';
    if (isAxiosError(statusData) || !statusData) return 'unsubscribed'; // 404 from backend
    const isActive = statusData.data?.data?.is_active;
    return isActive ? 'enabled' : 'disabled';
  })();

  // Subscribe — request permission + create push subscription + POST to backend
  const { mutateAsync: subscribeMutate, isPending: isSubscribing } = useMutation({
    mutationFn: (payload: Omit<PushNotification, 'is_active'>) => subscribeToNotifications(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-status'] });
      toast.success('Notifications enabled.');
    },
    onError() {
      toast.error('Something went wrong while subscribing to notifications.');
    },
  });

  async function subscribe() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm !== 'granted') return;

    try {
      const swReady = await navigator.serviceWorker.ready;
      const subscription = (
        await swReady.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
      ).toJSON();

      const newEndpoint = subscription.endpoint!;
      setEndpoint(newEndpoint);

      await subscribeMutate({
        endpoint: newEndpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      } as Omit<PushNotification, 'is_active'>);
    } catch {
      toast.error('Failed to set up push subscription.');
    }
  }

  // Toggle — flip is_active on backend
  const { mutate: toggleMutate, isPending: isToggling } = useMutation({
    mutationFn: () => toggleNotificationStatus(endpoint!),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['notification-status'] });
      const isActive = response.data?.data?.is_active;
      toast.success(isActive ? 'Notifications enabled.' : 'Notifications disabled.');
    },
    onError() {
      toast.error('Failed to update notification preference.');
    },
  });

  function toggle() {
    if (!endpoint) return;
    toggleMutate();
  }

  return {
    status,
    subscribe,
    toggle,
    isSubscribing,
    isToggling,
  };
}
