import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import { getAllSubscriptions } from '../../../actions';
import type { PushSubscription } from '@/types/push-subscription';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Set up webpush VAPID details
webpush.setVapidDetails(
  'https://formula-one-psi.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Test endpoint to manually trigger notification sending
export async function GET(request: NextRequest) {
  try {
    // Test 1: Check Redis connection
    const redisTest = await redis.ping();
    if (redisTest !== 'PONG') {
      return NextResponse.json({
        success: false,
        error: 'Redis connection failed',
      });
    }

    // Test 2: Get all subscriptions - try both methods for debugging
    let subscriptions = await getAllSubscriptions();
    
    // If getAllSubscriptions returns empty, check Redis directly
    if (subscriptions.length === 0) {
      try {
        const keys = await redis.smembers('subscriptions:all');
        const debugInfo: any = {
          setKeys: keys,
          setSize: Array.isArray(keys) ? keys.length : 0,
        };
        
        // Try to get subscriptions directly from Redis
        if (Array.isArray(keys) && keys.length > 0) {
          const directSubscriptions: PushSubscription[] = [];
          for (const key of keys as string[]) {
            const subData = await redis.get<string>(key);
            if (subData) {
              try {
                directSubscriptions.push(JSON.parse(subData) as PushSubscription);
              } catch (e) {
                debugInfo.invalidKeys = debugInfo.invalidKeys || [];
                debugInfo.invalidKeys.push({ key, error: String(e) });
              }
            } else {
              debugInfo.missingKeys = debugInfo.missingKeys || [];
              debugInfo.missingKeys.push(key);
            }
          }
          subscriptions = directSubscriptions;
          debugInfo.directSubscriptionsFound = directSubscriptions.length;
        }
        
        if (subscriptions.length === 0) {
          return NextResponse.json({
            success: false,
            message:
              'No subscriptions found. Please subscribe first from the main page.',
            subscriptionsCount: 0,
            debug: debugInfo,
          });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error checking subscriptions',
          details: String(error),
          subscriptionsCount: 0,
        });
      }
    }

    // Test 3: Send test notification to all subscribers
    const testTitle = 'Test Notification';
    const testBody = `This is a test notification sent at ${new Date().toLocaleString()}`;

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            subscription as any,
            JSON.stringify({
              title: testTitle,
              body: testBody,
              icon: '/icon-192x192.png',
            })
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          // Handle expired/invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            const key = `subscription:${subscription.endpoint}`;
            await redis.del(key);
            await redis.srem('subscriptions:all', key);
          }
          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error.message,
          };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: 'Test notifications sent',
      subscriptionsCount: subscriptions.length,
      notificationsSent: successful,
      notificationsFailed: failed,
      details: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
