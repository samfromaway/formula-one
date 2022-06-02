import Grid from '@mui/material/Grid';
import RacesCard from './ui/RacesCard/RacesCard';
import { Race } from './lib/getRaces';
import { makeDateRange } from './utils';
import isBefore from 'date-fns/isBefore';
import parseISO from 'date-fns/parseISO';
import { Box, Typography } from '@mui/material';
import { Spacer } from '@/components/layout';

type RacesPageProps = {
  races: Race[] | null;
  isUserTime: boolean;
};

const RacesPage = ({ races, isUserTime }: RacesPageProps) => {
  if (!races || races.length === 0) return null;
  const allDates = races.filter((e) => !isBefore(parseISO(e.date), new Date()));
  const nextRace = allDates[0];

  return (
    <>
      <Typography variant="h4">Next Race:</Typography>
      <Spacer space={2} />
      <Box maxWidth={600}>
        <RacesCard
          round={nextRace.round}
          country={nextRace.competition.location.country}
          dateRange={makeDateRange(nextRace.events, isUserTime)}
          timezone={nextRace.timezone}
          circuit={nextRace.circuit.name}
          img={nextRace.circuit.image}
          events={nextRace.events}
          status={nextRace.status}
          isNext={true}
          isUserTime={isUserTime}
          expandedByDefault={true}
        />
      </Box>
      <Spacer space={4} />
      <Typography variant="h4">All Races:</Typography>
      <Spacer space={2} />
      <Grid container spacing={4}>
        {races.map((e) => (
          <Grid item xs={12} sm={6} md={4} key={e.id}>
            <RacesCard
              round={e.round}
              country={e.competition.location.country}
              dateRange={makeDateRange(e.events, isUserTime)}
              timezone={e.timezone}
              circuit={e.circuit.name}
              img={e.circuit.image}
              events={e.events}
              status={e.status}
              isNext={nextRace.id === e.id}
              isUserTime={isUserTime}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default RacesPage;
