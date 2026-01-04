'use server';

import webpush from 'web-push';
import { Redis } from '@upstash/redis';

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
    await redis.set(key, JSON.stringify(sub));
    // Also maintain a set of all subscription keys for easy retrieval
    await redis.sadd('subscriptions:all', key);
    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error storing subscription:', error);
    return { success: false, error: 'Failed to store subscription' };
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

    for (const key of keys as string[]) {
      const subData = await redis.get<string>(key);
      if (subData) {
        try {
          subscriptions.push(JSON.parse(subData) as PushSubscription);
        } catch (e) {
          // Invalid subscription, remove it
          await redis.del(key);
          await redis.srem('subscriptions:all', key);
        }
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
