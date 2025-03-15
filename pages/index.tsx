import type { NextPage } from 'next';
import { useState } from 'react';
import { RacesPage } from '@/pages';
import { SelectChangeEvent } from '@mui/material';
import TimezoneSelect from '@/pages/races/ui/TimezoneSelect';
import useRaces from '@/pages/races/lib/useRaces';
import Head from 'next/head';
import PageFallback from '@/components/layout/PageFallback';
import { Spacer } from '@/components/layout';

const Home: NextPage = () => {
  const [timezone, setTimezone] = useState('UTC');
  const { data, errors, isLoading } = useRaces();

  const handleTimezoneChange = (event: SelectChangeEvent<string>) => {
    setTimezone(event.target.value);
  };

  const racesWithCorrectTime = data?.map((e) => e);

  return (
    <>
      <Head>
        <title>Formula 1: Races</title>
      </Head>
      <TimezoneSelect value={timezone} handleChange={handleTimezoneChange} />
      <Spacer space={2} />
      <PageFallback isLoading={isLoading} errors={errors}>
        <RacesPage races={data} timezone={timezone} />
      </PageFallback>
    </>
  );
};

export default Home;
