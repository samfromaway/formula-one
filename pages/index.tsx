import type { NextPage } from 'next';
import { useState } from 'react';
import { RacesPage } from '@/pages';
import { SelectChangeEvent } from '@mui/material';
import TimezoneSelect from '@/pages/races/ui/TimezoneSelect';
import useRaces from '@/pages/races/lib/useRaces';
import Head from 'next/head';
import PageFallback from '@/components/layout/PageFallback';
import { Spacer } from '@/components/layout';
import { DateTime } from 'luxon';

const Home = () => {
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
      <TimezoneSelect value={timezone} handleChange={handleTimezoneChange} />
      <Spacer space={2} />
      <PageFallback isLoading={isLoading} errors={errors}>
        <RacesPage races={racesWithTimeZoneTime} timezone={timezone} />
      </PageFallback>
    </>
  );
};

export default Home;
