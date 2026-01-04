import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getAllSubscriptions } from '../../../actions';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Debug endpoint to check subscription storage
export async function GET(request: NextRequest) {
  try {
    // Check Redis connection
    const pingResult = await redis.ping();

    // Get all keys in the subscriptions:all set
    const setKeys = await redis.smembers('subscriptions:all');

    // Get subscriptions using the action function
    const subscriptionsFromAction = await getAllSubscriptions();

    // Try to get subscriptions directly
    const directSubscriptions: any[] = [];
    if (Array.isArray(setKeys) && setKeys.length > 0) {
      for (const key of setKeys as string[]) {
        const subData = await redis.get<string>(key);
        if (subData) {
          try {
            directSubscriptions.push({
              key,
              data: JSON.parse(subData),
              raw: subData.substring(0, 100) + '...',
            });
          } catch (e) {
            directSubscriptions.push({
              key,
              error: String(e),
              raw: subData.substring(0, 100) + '...',
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
