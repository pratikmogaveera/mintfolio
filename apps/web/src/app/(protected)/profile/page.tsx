'use client';
import NotificationPrompt from '@/components/NotificationPrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/hooks/use-auth';
import { useNotification } from '@/lib/hooks/use-notification';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const router = useRouter();
  const { userDetails, isSuccess, isLoading, isError, error } = useAuth();
  const { status, subscribe, toggle, isSubscribing, isToggling } = useNotification();
  const searchParams = useSearchParams();
  const [promptDismissed, setPromptDismissed] = useState(false);
  const showPrompt = searchParams.get('new') === 'true' && status === 'unsubscribed' && !promptDismissed;

  function handleDismiss() {
    setPromptDismissed(true);
    router.replace('/profile');
  }

  async function handleEnable() {
    await subscribe();
    setPromptDismissed(true);
    router.replace('/profile');
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Profile card */}
      {isLoading ? (
        <Card className="mx-auto flex h-34 w-full max-w-sm flex-col">
          <Skeleton className="h-full w-full" />
        </Card>
      ) : (
        <Card className="mx-auto flex w-full max-w-sm flex-col">
          <CardHeader className="font-heading text-xl font-semibold">Profile</CardHeader>
          <Separator />
          {isSuccess ? (
            <CardContent className="flex flex-col gap-2">
              <div className="flex w-full items-center gap-3">
                <span className="font-semibold">Email:</span>
                <span>{userDetails?.email || '-'}</span>
              </div>
              <div className="flex w-full items-center gap-3">
                <span className="font-semibold">Username:</span>
                <span>{userDetails?.username || '-'}</span>
              </div>
              <div className="flex w-full items-center gap-3">
                <span className="font-semibold">Joined on:</span>
                <span>{dayjs(userDetails?.created_at).format('DD MMM YYYY HH:mm') || '-'}</span>
              </div>
            </CardContent>
          ) : (
            isError && (
              <CardContent className="text-red-600">
                {isAxiosError(error) ? error.response?.data?.message : error?.message}
              </CardContent>
            )
          )}
        </Card>
      )}

      {/* Settings card */}
      <Card className="mx-auto flex w-full max-w-sm flex-col">
        <CardHeader className="font-heading text-xl font-semibold">Settings</CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-3">
            <span className="font-semibold">Notifications</span>
            {status === 'unsubscribed' ? (
              <Button size="sm" onClick={subscribe} disabled={isSubscribing}>
                {isSubscribing ? 'Enabling...' : 'Enable'}
              </Button>
            ) : (
              <Switch
                size="sm"
                checked={status === 'enabled'}
                disabled={
                  status === 'loading' ||
                  status === 'unsupported' ||
                  status === 'denied' ||
                  isSubscribing ||
                  isToggling
                }
                onClick={() => {
                  if (status === 'enabled' || status === 'disabled') toggle();
                }}
              />
            )}
          </div>
          {status === 'denied' && (
            <p className="text-muted-foreground text-xs">
              Notifications are blocked. To enable, go to your browser settings and allow notifications for this site.
            </p>
          )}
          {status === 'unsupported' && (
            <p className="text-muted-foreground text-xs">
              Push notifications are not supported in this browser.
            </p>
          )}
        </CardContent>
      </Card>

      {/* NotificationPrompt — bottom sheet on mobile, centered modal on desktop */}
      <Dialog open={showPrompt} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center">
            <NotificationPrompt onEnable={handleEnable} onDismiss={handleDismiss} isLoading={isSubscribing} />
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
