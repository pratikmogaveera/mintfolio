'use client';

import axios from 'axios';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('SW registered:', reg.scope);
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });

    async function handleNotificationPermission() {
      const notificationPermission = await Notification.requestPermission();
      if (notificationPermission === 'granted') {
        const swReady = await navigator.serviceWorker.ready;
        const existingSub = await swReady.pushManager.getSubscription();
        if (existingSub) return; // already subscribed
        const subscription = (
          await swReady.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })
        ).toJSON();

        const payload = {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
        };

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/notifications/subscribe`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json',
          },
        });
      }
    }
    handleNotificationPermission();
  }, []);

  return (
    <div className="h-full w-full">
      <main>
        <h1 className="text-xl font-semibold">Test Subscribe</h1>
      </main>
    </div>
  );
}
