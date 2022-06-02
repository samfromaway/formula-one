import type { NextPage } from 'next';
import { useState } from 'react';
import { RacesPage } from '@/pages';
import { SelectChangeEvent } from '@mui/material';
import TimezoneSelect from '@/pages/races/ui/TimezoneSelect';
import useRaces from '@/pages/races/lib/useRaces';
import Head from 'next/head';
import PageFallback from '@/components/layout/PageFallback';

const Home: NextPage = () => {
  const [timezone, setTimezone] = useState('Your Time');
  const { data, errors, isLoading } = useRaces(timezone);

  const isUserTime = timezone === 'Your Time';

  const handleTimezoneChange = (event: SelectChangeEvent<string>) => {
    setTimezone(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Formula 1 Info: Races</title>
      </Head>
      <TimezoneSelect value={timezone} handleChange={handleTimezoneChange} />
      <PageFallback isLoading={isLoading} errors={errors}>
        <RacesPage races={data} isUserTime={isUserTime} />
      </PageFallback>
    </>
  );
};

export default Home;
