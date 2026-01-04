import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Test endpoint to manually test storing a subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const key = `subscription:${subscription.endpoint}`;
    const serialized = JSON.stringify(subscription);

    // Step 1: Store the data
    const setResult = await redis.set(key, serialized);
    
    // Step 2: Immediately verify
    const verifyData = await redis.get<string>(key);
    
    // Step 3: Add to set
    const saddResult = await redis.sadd('subscriptions:all', key);
    
    // Step 4: Verify set membership
    const setMembers = await redis.smembers('subscriptions:all');
    const isInSet = Array.isArray(setMembers) && setMembers.includes(key);
    
    // Step 5: Get again after adding to set
    const verifyDataAfter = await redis.get<string>(key);

    return NextResponse.json({
      success: true,
      steps: {
        set: {
          result: setResult,
          key,
          dataLength: serialized.length,
        },
        verifyAfterSet: {
          found: !!verifyData,
          dataLength: verifyData ? verifyData.length : 0,
          matches: verifyData === serialized,
        },
        addToSet: {
          result: saddResult,
        },
        verifySetMembership: {
          inSet: isInSet,
          allMembers: setMembers,
        },
        verifyAfterSetAdd: {
          found: !!verifyDataAfter,
          dataLength: verifyDataAfter ? verifyDataAfter.length : 0,
          matches: verifyDataAfter === serialized,
        },
      },
      subscription: {
        endpoint: subscription.endpoint,
        hasKeys: !!subscription.keys,
        keysPresent: subscription.keys ? Object.keys(subscription.keys) : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to store subscription',
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

