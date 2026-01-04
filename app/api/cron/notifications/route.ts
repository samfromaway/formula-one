import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import getData from '@/lib/getData';

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

// Generate a unique notification ID for deduplication
function getNotificationId(raceName: string, eventType: string, eventDate: string, eventTime: string): string {
  return `notification:${raceName}:${eventType}:${eventDate}:${eventTime}`;
}

// Check if notification was already sent
async function wasNotificationSent(notificationId: string): Promise<boolean> {
  const sent = await redis.get<boolean>(notificationId);
  return sent === true;
}

// Mark notification as sent
async function markNotificationSent(notificationId: string): Promise<void> {
  // Store for 7 days to prevent duplicates
  await redis.set(notificationId, true, { ex: 7 * 24 * 60 * 60 });
}

// Send notification to a subscription
async function sendNotificationToSubscription(
  subscription: PushSubscription,
  title: string,
  body: string
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png',
      })
    );
    return true;
  } catch (error: any) {
    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is expired or invalid, remove it
      const key = `subscription:${subscription.endpoint}`;
      await redis.del(key);
      await redis.srem('subscriptions:all', key);
    }
    // eslint-disable-next-line no-console
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  // Vercel Cron sends the authorization header with the secret if configured
  // For development/testing, you can temporarily comment this out or set CRON_SECRET
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Fetch race data
    const { data: races, errors } = await getData();

    if (errors || !races) {
      return NextResponse.json(
        { error: 'Failed to fetch race data', details: errors },
        { status: 500 }
      );
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find events starting within the next hour (and not in the past 15 minutes to avoid duplicates)
    const upcomingEvents: Array<{
      raceName: string;
      eventType: string;
      eventDate: Date;
      date: string;
      time: string;
    }> = [];

    for (const race of races) {
      for (const event of race.events) {
        // Only check for Qualifying and Race events
        if (event.type !== 'Qualifying' && event.type !== 'Race') {
          continue;
        }

        // Parse event date/time as UTC (API returns UTC times)
        const eventDateTime = new Date(`${event.date}T${event.time}Z`);
        
        // Check if event is between 15 minutes ago and 1 hour from now
        // This accounts for the cron running every 15 minutes
        if (eventDateTime >= fifteenMinutesAgo && eventDateTime <= oneHourFromNow) {
          upcomingEvents.push({
            raceName: race.raceName,
            eventType: event.type,
            eventDate: eventDateTime,
            date: event.date,
            time: event.time,
          });
        }
      }
    }

    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events starting within the next hour',
        eventsChecked: 0,
      });
    }

    // Get all subscriptions
    const subscriptions: PushSubscription[] = [];
    try {
      const keys = await redis.smembers('subscriptions:all');
      
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error retrieving subscriptions:', error);
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        eventsFound: upcomingEvents.length,
        notificationsSent: 0,
      });
    }

    // Send notifications for each event
    let notificationsSent = 0;
    let notificationsSkipped = 0;

    for (const event of upcomingEvents) {
      const notificationId = getNotificationId(
        event.raceName,
        event.eventType,
        event.date,
        event.time
      );

      // Check if already sent
      const alreadySent = await wasNotificationSent(notificationId);
      if (alreadySent) {
        notificationsSkipped++;
        continue;
      }

      // Calculate time until event
      const minutesUntilEvent = Math.round(
        (event.eventDate.getTime() - now.getTime()) / (1000 * 60)
      );
      const timeText = minutesUntilEvent <= 0 
        ? 'starting now' 
        : `in ${minutesUntilEvent} minute${minutesUntilEvent !== 1 ? 's' : ''}`;

      const title = `${event.raceName} - ${event.eventType}`;
      const body = `Starts ${timeText}`;

      // Send to all subscriptions
      const sendPromises = subscriptions.map((subscription) =>
        sendNotificationToSubscription(subscription, title, body)
      );

      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length;

      if (successCount > 0) {
        await markNotificationSent(notificationId);
        notificationsSent += successCount;
      }
    }

    return NextResponse.json({
      success: true,
      eventsFound: upcomingEvents.length,
      notificationsSent,
      notificationsSkipped,
      subscriptionsCount: subscriptions.length,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

