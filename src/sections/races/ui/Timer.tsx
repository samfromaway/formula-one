import { useState, useEffect } from 'react';
import parseISO from 'date-fns/parseISO';
import intervalToDuration from 'date-fns/intervalToDuration';
import { Box, Grid, Typography } from '@mui/material';

type TimerProps = {
  date: string;
};

const Timer = ({ date }: TimerProps) => {
  const [now, setNow] = useState(new Date());
  const intervalDuration = intervalToDuration({
    start: parseISO(date),
    end: now,
  });

  useEffect(() => {
    let myInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  const times = [
    { label: 'Days', data: intervalDuration.days },
    { label: 'Hours', data: intervalDuration.hours },
    { label: 'Minutes', data: intervalDuration.minutes },
    { label: 'Seconds', data: intervalDuration.seconds },
  ];

  return (
    <Grid container maxWidth="350px">
      {times.map((e) => (
        <Grid item key={e.label} xs={3}>
          <Typography variant="h5" textAlign="center">
            {e.data}
          </Typography>
          <Typography color="text.secondary" variant="body1" textAlign="center">
            {e.label}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

export default Timer;
