'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('SW registered:', reg.scope);
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  }, []);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Home Page.</h1>
      {/* Portfolio dashboard will go here */}
    </div>
  );
}
