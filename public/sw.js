self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        tag: data.tag || 'f1-notification',
        requireInteraction: false,
        data: {
          dateOfArrival: Date.now(),
          url: data.url || '/',
        },
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (error) {
      console.error('Error processing push notification:', error);
      // Fallback notification if JSON parsing fails
      event.waitUntil(
        self.registration.showNotification('Formula 1', {
          body: 'New race event notification',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        })
      );
    }
  } else {
    // Fallback for notifications without data
    event.waitUntil(
      self.registration.showNotification('Formula 1', {
        body: 'New race event notification',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  event.notification.close();

  const urlToOpen =
    event.notification.data?.url || 'https://formula-one-psi.vercel.app';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
