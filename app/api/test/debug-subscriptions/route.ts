import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getAllSubscriptions } from '../../../actions';
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
    location: 'debug-subscriptions/route.ts:5',
    message: 'Debug endpoint Redis instance created',
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

// Debug endpoint to check subscription storage
export async function GET(request: NextRequest) {
  try {
    // Check Redis connection
    const pingResult = await redis.ping();

    // Get all keys in the subscriptions:all set
    const setKeys = await redis.smembers('subscriptions:all');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'debug-subscriptions/route.ts:20',
        message: 'got set keys',
        data: {
          setKeysCount: Array.isArray(setKeys) ? setKeys.length : 0,
          setKeys: Array.isArray(setKeys) ? setKeys : [],
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    // #endregion

    // Get subscriptions using the action function
    const subscriptionsFromAction = await getAllSubscriptions();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'debug-subscriptions/route.ts:23',
        message: 'got subscriptions from action',
        data: { count: subscriptionsFromAction.length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    // #endregion

    // Try to get subscriptions directly
    const directSubscriptions: any[] = [];
    if (Array.isArray(setKeys) && setKeys.length > 0) {
      for (const key of setKeys as string[]) {
        // Upstash Redis auto-deserializes JSON, so get as object directly
        const subData = await redis.get<PushSubscription>(key);
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/cbbc9795-d140-4fb1-9e14-c260641f4172',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'debug-subscriptions/route.ts:29',
              message: 'trying to get key from redis',
              data: { key, found: !!subData, hasEndpoint: !!subData?.endpoint },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A,D',
            }),
          }
        ).catch(() => {});
        // #endregion
        if (subData) {
          try {
            // Data is already parsed by Upstash Redis
            directSubscriptions.push({
              key,
              data: subData,
            });
          } catch (e) {
            directSubscriptions.push({
              key,
              error: String(e),
            });
          }
        } else {
          directSubscriptions.push({
            key,
            error: 'Key exists in set but no data found',
          });
        }
      }
    }

    return NextResponse.json({
      redis: {
        ping: pingResult,
        connected: pingResult === 'PONG',
      },
      subscriptionsSet: {
        name: 'subscriptions:all',
        keys: setKeys,
        count: Array.isArray(setKeys) ? setKeys.length : 0,
      },
      subscriptionsFromAction: {
        count: subscriptionsFromAction.length,
        subscriptions: subscriptionsFromAction.map((s) => ({
          endpoint: s.endpoint,
          hasKeys: !!s.keys,
          keysPresent: s.keys ? Object.keys(s.keys) : [],
        })),
      },
      directSubscriptions: {
        count: directSubscriptions.length,
        subscriptions: directSubscriptions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug check failed',
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
