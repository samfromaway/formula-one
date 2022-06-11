import RacesCard from './ui/RacesCard/RacesCard';
import Timer from './ui/Timer';
import { Race } from './lib/getRaces';
import { makeDateRange } from './utils';
import isBefore from 'date-fns/isBefore';
import parseISO from 'date-fns/parseISO';
import { Box, Typography } from '@mui/material';
import { Spacer } from '@/components/layout';
import { DynamicGrid } from '@/components/ui';
import isPast from 'date-fns/isPast';

type RacesPageProps = {
  races: Race[] | null;
  isUserTime: boolean;
};

const RacesPage = ({ races, isUserTime }: RacesPageProps) => {
  if (!races || races.length === 0) return null;
  const allFutureDates = races.filter(
    (e) => !isBefore(parseISO(e.date), new Date())
  );
  const nextRace = allFutureDates[0];
  const nextQualyDate = nextRace.events.find(
    (e) => e.type === 'Qualifying'
  )?.date;

  const qualyHasPast = nextQualyDate ? isPast(parseISO(nextQualyDate)) : false;
  const nextEventTitle = qualyHasPast ? 'Next Race' : 'Next Qualifying';

  const displayTimerDate = () => {
    if (!nextQualyDate) return nextRace.date;
    if (qualyHasPast) return nextRace.date;
    return nextQualyDate;
  };

  return (
    <>
      <Typography variant="h4">{nextEventTitle}:</Typography>
      <Spacer space={2} />
      <Timer date={displayTimerDate()} />

      <Spacer space={3} />
      <Box maxWidth={400}>
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
      <DynamicGrid
        spacing={4}
        maxColumns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
        fullWidth
      >
        {races.map((e) => (
          <RacesCard
            key={e.id}
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
        ))}
      </DynamicGrid>
    </>
  );
};

export default RacesPage;
