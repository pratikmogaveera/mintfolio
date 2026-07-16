self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
  console.log('[Service Worker] Installed.')
});

self.addEventListener('activate', () => {
  console.log('[Service Worker] Activated.');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mintfolio';
  const options = {
    body: data.body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'portfolio-daily',        // replaces previous day's notification
    data: { url: '/' },            // use in notificationclick to open app
    actions: [{ action: 'open', title: 'View Portfolio' }],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});