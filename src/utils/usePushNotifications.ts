import { useState, useEffect, useCallback } from 'react';
import { subscribeUser, unsubscribeUser } from '../../app/actions';
import type { PushSubscription as SerializedPushSubscription } from '@/types/push-subscription';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to convert ArrayBuffer to base64url string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to properly serialize browser PushSubscription to server format
function serializeSubscription(
  sub: globalThis.PushSubscription
): SerializedPushSubscription {
  // Manually extract keys from the PushSubscription object
  // The browser's PushSubscription.getKey() returns ArrayBuffers
  const p256dh = sub.getKey('p256dh');
  const auth = sub.getKey('auth');

  if (!p256dh || !auth) {
    // Fallback to JSON.stringify if getKey doesn't work
    const serialized = JSON.parse(JSON.stringify(sub));
    return {
      endpoint: sub.endpoint,
      keys: {
        p256dh: serialized.keys?.p256dh || '',
        auth: serialized.keys?.auth || '',
      },
    };
  }

  // Convert ArrayBuffers to base64url strings
  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(p256dh),
      auth: arrayBufferToBase64(auth),
    },
  };
}

export default function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] =
    useState<globalThis.PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  const subscribeToPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);

      const serializedSub = serializeSubscription(sub);
      const result = await subscribeUser(serializedSub);

      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe:', result.error);
        alert(
          `Failed to subscribe: ${result.error}${
            result.details ? ` - ${result.details}` : ''
          }`
        );
        // Revert subscription state on failure
        await sub.unsubscribe();
        setSubscription(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in subscribeToPush:', error);
      alert(
        `Error subscribing: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      const serializedSub = serializeSubscription(subscription);
      await unsubscribeUser(serializedSub);
      setSubscription(null);
    }
  }, [subscription]);

  return {
    isSupported,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
