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

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  const sendTestNotification = useCallback(async () => {
    if (subscription) {
      // The 'message' state at the time of execution will be used.
      // If 'message' is updated after the timeout is set, this function,
      // when called by setTimeout, will use the 'message' value from the render
      // in which this useCallback was last created (due to its dependencies).
      await sendNotification(message);
      // Optionally, clear or change the message after sending
      // setMessage(''); // Example: clear message after sending
      console.log(`Notification sent with message: "${message}"`);
    } else {
      console.log('No subscription active. Notification not sent.');
    }
  }, [subscription, message]); // Dependencies: if these change, sendTestNotification is re-memoized.

  useEffect(() => {
    let timerId; // To store the timeout ID for cleanup

    const scheduleNotification = () => {
      const now = new Date();
      let notificationTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        8,
        59,
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
        console.log(
          `Notification scheduled for: ${notificationTime.toLocaleString()}`
        );
        timerId = setTimeout(() => {
          console.log("It's 8:45 AM. Triggering notification...");
          sendTestNotification();

          // If you want the notification to repeat daily, you would need to
          // reschedule it here for the next day (e.g., another setTimeout for 24 hours).
          // For a one-time scheduled notification (per component mount), this is sufficient.
        }, delay);
      } else {
        // This should ideally not happen with the above logic
        console.error(
          'Calculated delay is not positive. Notification not scheduled.'
        );
      }
    };

    scheduleNotification();

    return () => {
      if (timerId) {
        clearTimeout(timerId);
        console.log('Scheduled 8:45 AM notification has been cleared.');
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

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>
          .
        </p>
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
      <InstallPrompt />
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
