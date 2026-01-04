import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Test endpoint to verify Redis operations work correctly
export async function GET(request: NextRequest) {
  const testKey = 'test:subscription:debug';
  const testData = JSON.stringify({ endpoint: 'test', keys: { p256dh: 'test', auth: 'test' } });
  
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Ping
    const ping = await redis.ping();
    results.steps.push({ step: 'ping', result: ping, success: ping === 'PONG' });

    // Step 2: Set test data
    const setResult = await redis.set(testKey, testData);
    results.steps.push({ step: 'set', result: setResult, success: setResult === 'OK' });

    // Step 3: Get immediately
    const getImmediate = await redis.get<string>(testKey);
    results.steps.push({ 
      step: 'get_immediate', 
      result: getImmediate, 
      found: !!getImmediate,
      matches: getImmediate === testData,
      success: getImmediate === testData 
    });

    // Step 4: Add to set
    const saddResult = await redis.sadd('test:subscriptions:all', testKey);
    results.steps.push({ step: 'sadd', result: saddResult, success: typeof saddResult === 'number' });

    // Step 5: Get after sadd
    const getAfterSadd = await redis.get<string>(testKey);
    results.steps.push({ 
      step: 'get_after_sadd', 
      result: getAfterSadd, 
      found: !!getAfterSadd,
      matches: getAfterSadd === testData,
      success: getAfterSadd === testData 
    });

    // Step 6: Get set members
    const setMembers = await redis.smembers('test:subscriptions:all');
    results.steps.push({ 
      step: 'smembers', 
      result: setMembers, 
      found: Array.isArray(setMembers) && setMembers.includes(testKey),
      success: Array.isArray(setMembers) && setMembers.includes(testKey)
    });

    // Step 7: Get using the key from set
    if (Array.isArray(setMembers) && setMembers.length > 0) {
      const keyFromSet = setMembers[0];
      const getFromSetKey = await redis.get<string>(keyFromSet);
      results.steps.push({ 
        step: 'get_from_set_key', 
        key: keyFromSet,
        result: getFromSetKey, 
        found: !!getFromSetKey,
        matches: getFromSetKey === testData,
        success: getFromSetKey === testData 
      });
    }

    // Cleanup
    await redis.del(testKey);
    await redis.srem('test:subscriptions:all', testKey);

    results.success = results.steps.every(s => s.success);
    return NextResponse.json(results);
  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error);
    results.stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(results, { status: 500 });
  }
}

