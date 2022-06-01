import type { NextPage } from 'next';
import { useState } from 'react';
import { RacesPage } from '@/pages';
import { SelectChangeEvent, TextField } from '@mui/material';
import TimezoneSelect from '@/pages/races/ui/TimezoneSelect';
import { Spacer } from '@/components/layout';
import useRaces from '@/pages/races/lib/useRaces';
import Head from 'next/head';
import PageFallback from '@/components/layout/PageFallback';
import { makeRaces, races } from '@/pages/races/lib/getRaces';

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
      <Spacer space={2} />
      <TextField id="outlined-basic" label="Outlined" variant="outlined" />

      <PageFallback isLoading={isLoading} errors={errors}>
        <RacesPage races={makeRaces(races)} isUserTime={isUserTime} />
      </PageFallback>
    </>
  );
};

export default Home;
