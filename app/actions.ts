'use server';

import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import type { PushSubscription } from '@/types/push-subscription';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

webpush.setVapidDetails(
  'https://formula-one-psi.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Generate a unique key for each subscription using the endpoint URL
function getSubscriptionKey(sub: PushSubscription): string {
  return `subscription:${sub.endpoint}`;
}

export async function subscribeUser(sub: PushSubscription) {
  try {
    const key = getSubscriptionKey(sub);

    // Validate subscription has required fields
    if (!sub.endpoint) {
      return { success: false, error: 'Subscription missing endpoint' };
    }
    if (!sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      return { success: false, error: 'Subscription missing keys' };
    }

    // Store the subscription data directly (Upstash Redis auto-serializes/deserializes JSON)
    // Store the object directly - Upstash Redis will serialize it
    await redis.set(key, sub);

    // Verify it was stored immediately
    // Retrieve as object (Upstash Redis auto-deserializes JSON)
    const verifyData = await redis.get<PushSubscription>(key);

    // Check if data is missing or invalid
    if (
      !verifyData ||
      !verifyData.endpoint ||
      !verifyData.keys ||
      !verifyData.keys.p256dh ||
      !verifyData.keys.auth
    ) {
      // eslint-disable-next-line no-console
      console.error('[subscribeUser] Verification failed - data invalid');
      return {
        success: false,
        error: 'Failed to store subscription - verification failed',
      };
    }

    // Also maintain a set of all subscription keys for easy retrieval
    await redis.sadd('subscriptions:all', key);

    // Verify again after adding to set
    const verifyAfterSet = await redis.get<PushSubscription>(key);
    if (!verifyAfterSet || !verifyAfterSet.endpoint || !verifyAfterSet.keys) {
      // eslint-disable-next-line no-console
      console.error('[subscribeUser] Data lost after adding to set');
      return {
        success: false,
        error: 'Data lost after adding to set',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to store subscription',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function unsubscribeUser(sub: PushSubscription) {
  try {
    const key = getSubscriptionKey(sub);
    await redis.del(key);
    await redis.srem('subscriptions:all', key);
    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing subscription:', error);
    return { success: false, error: 'Failed to remove subscription' };
  }
}

// Helper function to get all subscriptions (used by cron job)
export async function getAllSubscriptions(): Promise<PushSubscription[]> {
  try {
    const keys = await redis.smembers('subscriptions:all');
    const subscriptions: PushSubscription[] = [];
    const orphanedKeys: string[] = [];

    for (const key of keys as string[]) {
      // Upstash Redis auto-deserializes JSON, so get as object directly
      const subData = await redis.get<PushSubscription>(key);
      if (subData) {
        try {
          // Data is already parsed by Upstash Redis
          const parsed = subData;
          // Validate the subscription has required fields
          if (
            parsed.endpoint &&
            parsed.keys &&
            parsed.keys.p256dh &&
            parsed.keys.auth
          ) {
            subscriptions.push(parsed);
          } else {
            // Invalid structure, mark for cleanup
            orphanedKeys.push(key);
          }
        } catch (e) {
          // Invalid JSON, mark for cleanup
          orphanedKeys.push(key);
        }
      } else {
        // Key in set but no data, mark for cleanup
        orphanedKeys.push(key);
      }
    }

    // Clean up orphaned keys
    if (orphanedKeys.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Cleaning up ${orphanedKeys.length} orphaned subscription keys`
      );
      for (const key of orphanedKeys) {
        await redis.del(key);
        await redis.srem('subscriptions:all', key);
      }
    }

    return subscriptions;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error retrieving subscriptions:', error);
    return [];
  }
}

// Test function to send a notification to a specific subscription
export async function sendNotification(
  subscription: PushSubscription,
  message: string
) {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon-192x192.png',
      })
    );
    return { success: true };
  } catch (error: any) {
    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      const key = `subscription:${subscription.endpoint}`;
      await redis.del(key);
      await redis.srem('subscriptions:all', key);
    }
    // eslint-disable-next-line no-console
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
