/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { RacesPage } from '@/sections';
import { Box, Button, SelectChangeEvent, TextField } from '@mui/material';
import TimezoneSelect from '@/sections/races/ui/TimezoneSelect';
import useRaces from '@/sections/races/lib/useRaces';
import Head from 'next/head';
import PageFallback from '@/components/layout/PageFallback';
import { Spacer } from '@/components/layout';
import { DateTime } from 'luxon';
import { subscribeUser, unsubscribeUser, sendNotification } from './actions';

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

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');

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

  // Helper to convert ArrayBuffer to base64url string
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Helper to properly serialize PushSubscription
  function serializeSubscription(sub: PushSubscription) {
    // Manually extract keys from the PushSubscription object
    // The browser's PushSubscription.getKey() returns ArrayBuffers
    const p256dh = sub.getKey ? sub.getKey('p256dh') : null;
    const auth = sub.getKey ? sub.getKey('auth') : null;

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

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);

      // Log the raw subscription for debugging
      // eslint-disable-next-line no-console
      console.log('Raw subscription:', {
        endpoint: sub.endpoint,
        keys: sub.getKey
          ? {
              p256dh: sub.getKey('p256dh') ? 'present' : 'missing',
              auth: sub.getKey('auth') ? 'present' : 'missing',
            }
          : 'no getKey method',
      });

      const serializedSub = serializeSubscription(sub);

      // Log the serialized subscription
      // eslint-disable-next-line no-console
      console.log('Serialized subscription:', {
        endpoint: serializedSub.endpoint,
        hasKeys: !!serializedSub.keys,
        keysType: typeof serializedSub.keys,
        keysPresent: serializedSub.keys ? Object.keys(serializedSub.keys) : [],
        p256dhType: serializedSub.keys?.p256dh
          ? typeof serializedSub.keys.p256dh
          : 'missing',
        authType: serializedSub.keys?.auth
          ? typeof serializedSub.keys.auth
          : 'missing',
      });

      const result = await subscribeUser(serializedSub);

      // eslint-disable-next-line no-console
      console.log('Subscribe result:', result);

      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe:', result.error, result);
        alert(
          `Failed to subscribe: ${result.error}${
            result.details ? ` - ${result.details}` : ''
          }${result.debug ? ` - Debug: ${JSON.stringify(result.debug)}` : ''}`
        );
      } else {
        // eslint-disable-next-line no-console
        console.log('Successfully subscribed!');
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
  }

  async function unsubscribeFromPush() {
    if (subscription) {
      await subscription.unsubscribe();
      const serializedSub = serializeSubscription(subscription);
      await unsubscribeUser(serializedSub);
    }
    setSubscription(null);
  }

  const sendTestNotification = useCallback(async () => {
    if (subscription) {
      const serializedSub = serializeSubscription(subscription);
      await sendNotification(serializedSub, message);
    }
  }, [subscription, message]);

  useEffect(() => {
    let timerId: any; // To store the timeout ID for cleanup

    const scheduleNotification = () => {
      const now = new Date();
      let notificationTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        9,
        1,
        0,
        0
      );

      // If 8:45 AM today has already passed, schedule it for 8:45 AM tomorrow
      if (now.getTime() >= notificationTime.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
        // Ensure the time is still 8:45 AM for the next day
        notificationTime.setHours(8, 45, 0, 0);
      }

      const delay = notificationTime.getTime() - now.getTime();

      if (delay > 0) {
        timerId = setTimeout(() => {
          sendTestNotification();

          // If you want the notification to repeat daily, you would need to
          // reschedule it here for the next day (e.g., another setTimeout for 24 hours).
          // For a one-time scheduled notification (per component mount), this is sufficient.
        }, delay);
      } else {
        // This should ideally not happen with the above logic
      }
    };

    scheduleNotification();

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [sendTestNotification]);

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
          <TextField
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendTestNotification}>Send Test</Button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <Button onClick={subscribeToPush}>Subscribe</Button>
        </>
      )}
    </div>
  );
}

const Page = () => {
  const [timezone, setTimezone] = useState('Europe/Zurich');
  const { data, errors, isLoading } = useRaces();

  const handleTimezoneChange = (event: SelectChangeEvent<string>) => {
    setTimezone(event.target.value);
  };

  const formatTimeForTimezone = (
    dateString: string,
    timeString: string,
    timezone: string
  ) => {
    const dateTimeString = `${dateString}T${timeString}`;

    // Treat input as UTC and convert to the selected timezone
    const dt = DateTime.fromISO(dateTimeString, { zone: 'UTC' }) // Assume input is in UTC
      .setZone(timezone); // Luxon will automatically handle DST here

    return dt.toFormat('yyyy-MM-dd HH:mm:ss');
  };

  const racesWithTimeZoneTime = data?.map((e) => ({
    ...e,
    events: e.events.map((event) => ({
      ...event,
      date: event.date,
      time: event.time,
      timezoneDate: formatTimeForTimezone(
        event.date,
        event.time,
        timezone
      ).split(' ')[0],
      timezoneTime: formatTimeForTimezone(
        event.date,
        event.time,
        timezone
      ).split(' ')[1],
    })),
  }));

  if (!racesWithTimeZoneTime) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Formula 1: Races</title>
      </Head>
      <PushNotificationManager />
      <Box p={4} />
      <TimezoneSelect value={timezone} handleChange={handleTimezoneChange} />
      <Spacer space={2} />
      <PageFallback isLoading={isLoading} errors={errors}>
        <RacesPage races={racesWithTimeZoneTime} timezone={timezone} />
      </PageFallback>
    </>
  );
};

export default Page;
