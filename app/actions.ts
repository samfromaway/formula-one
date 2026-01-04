'use server';

import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import type { PushSubscription } from '@/types/push-subscription';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});
// #region agent log
fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'actions.ts:7',
    message: 'Redis instance created',
    data: {
      hasUrl: !!process.env.KV_REST_API_URL,
      hasToken: !!process.env.KV_REST_API_TOKEN,
      urlLength: process.env.KV_REST_API_URL?.length || 0,
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'D',
  }),
}).catch(() => {});
// #endregion

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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'actions.ts:23',
      message: 'subscribeUser entry',
      data: {
        endpoint: sub.endpoint,
        hasKeys: !!sub.keys,
        keysPresent: sub.keys ? Object.keys(sub.keys) : [],
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A,B,C',
    }),
  }).catch(() => {});
  // #endregion
  try {
    const key = getSubscriptionKey(sub);

    // Validate subscription has required fields
    if (!sub.endpoint) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'actions.ts:30',
            message: 'validation failed - missing endpoint',
            data: {},
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }
      ).catch(() => {});
      // #endregion
      return { success: false, error: 'Subscription missing endpoint' };
    }
    if (!sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'actions.ts:33',
            message: 'validation failed - missing keys',
            data: {
              hasKeys: !!sub.keys,
              hasP256dh: !!sub.keys?.p256dh,
              hasAuth: !!sub.keys?.auth,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }
      ).catch(() => {});
      // #endregion
      return { success: false, error: 'Subscription missing keys' };
    }

    // Serialize the subscription
    const serialized = JSON.stringify(sub);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:36',
        message: 'before redis.set',
        data: {
          key,
          serializedLength: serialized.length,
          serializedPreview: serialized.substring(0, 200),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,C',
      }),
    }).catch(() => {});
    // #endregion

    // Store the subscription data first
    // Note: Upstash Redis set() returns 'OK' on success
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] BEFORE redis.set:', {
      key,
      serializedLength: serialized.length,
      serializedPreview: serialized.substring(0, 100),
      endpoint: sub.endpoint,
    });
    
    let setResult;
    try {
      setResult = await redis.set(key, serialized);
    } catch (setError) {
      // eslint-disable-next-line no-console
      console.error('[subscribeUser] redis.set ERROR:', {
        key,
        error: setError instanceof Error ? setError.message : String(setError),
        stack: setError instanceof Error ? setError.stack : undefined,
      });
      throw setError;
    }

    // eslint-disable-next-line no-console
    console.log('[subscribeUser] AFTER redis.set:', {
      key,
      setResult,
      setResultType: typeof setResult,
      setResultIsOK: setResult === 'OK',
      serializedLength: serialized.length,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:47',
        message: 'after redis.set',
        data: { key, setResult, setResultType: typeof setResult },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion

    // Verify it was stored immediately
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] BEFORE redis.get verification:', { key });
    const verifyData = await redis.get<string>(key);
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] AFTER redis.get verification:', {
      key,
      verifyDataFound: !!verifyData,
      verifyDataLength: verifyData?.length || 0,
      verifyDataMatches: verifyData === serialized,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:53',
        message: 'after redis.get verification',
        data: {
          key,
          verifyDataFound: !!verifyData,
          verifyDataLength: verifyData?.length || 0,
          matches: verifyData === serialized,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,E',
      }),
    }).catch(() => {});
    // #endregion
    if (!verifyData) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'actions.ts:54',
            message: 'verification failed - data not found',
            data: { key, setResult },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A',
          }),
        }
      ).catch(() => {});
      // #endregion
      return {
        success: false,
        error: 'Failed to store subscription - verification failed',
        debug: { key, setResult, verifyData: null },
      };
    }

    // Also maintain a set of all subscription keys for easy retrieval
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] BEFORE redis.sadd:', { key });
    const saddResult = await redis.sadd('subscriptions:all', key);
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] AFTER redis.sadd:', { key, saddResult });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:71',
        message: 'after redis.sadd',
        data: { key, saddResult },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    // Verify again after adding to set
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] BEFORE final verification:', { key });
    const verifyAfterSet = await redis.get<string>(key);
    // eslint-disable-next-line no-console
    console.log('[subscribeUser] AFTER final verification:', {
      key,
      verifyAfterSetFound: !!verifyAfterSet,
      verifyAfterSetLength: verifyAfterSet?.length || 0,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:77',
        message: 'after redis.sadd verification',
        data: {
          key,
          verifyAfterSetFound: !!verifyAfterSet,
          verifyAfterSetLength: verifyAfterSet?.length || 0,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    if (!verifyAfterSet) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'actions.ts:78',
            message: 'data disappeared after sadd',
            data: { key, setResult, saddResult },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        }
      ).catch(() => {});
      // #endregion
      return {
        success: false,
        error: 'Data lost after adding to set',
        debug: { key, setResult, saddResult },
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:88',
        message: 'subscribeUser success',
        data: { key },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,B,C',
      }),
    }).catch(() => {});
    // #endregion
    return { success: true };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'actions.ts:90',
        message: 'subscribeUser error',
        data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,C',
      }),
    }).catch(() => {});
    // #endregion
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
      const subData = await redis.get<string>(key);
      if (subData) {
        try {
          const parsed = JSON.parse(subData) as PushSubscription;
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
