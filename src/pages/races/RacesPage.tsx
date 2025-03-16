import RacesCard from './ui/RacesCard/RacesCard';
import Timer from './ui/Timer';
import { RaceWTimezone } from './lib/getRaces';
import { Box, Typography } from '@mui/material';
import { Spacer } from '@/components/layout';
import { DynamicGrid } from '@/components/ui';
import { formatDateFromISOString } from '@/utils/dates';

type RacesPageProps = {
  races: RaceWTimezone | null;
  timezone: string;
};

const RacesPage = ({ races, timezone }: RacesPageProps) => {
  if (!races || races.length === 0) return null;

  const allUpcomingRaces = races.filter((race) => {
    const raceDate = new Date(`${race.date}T${race.time}`);
    return raceDate > new Date();
  });

  const nextRace = allUpcomingRaces[0];

  function getNextEvent() {
    const events = nextRace.events;
    const currentDateTime = new Date();

    const upcomingEvents = events
      .map((event) => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        return { ...event, eventDate };
      })
      .filter((e) => e.eventDate > currentDateTime);

    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  }

  const nextEventData = getNextEvent();

  return (
    <>
      {nextEventData && (
        <>
          <Typography variant="h4">
            {nextRace.raceName} - {nextEventData?.type}
          </Typography>
          <Spacer space={2} />
          <Timer date={`${nextEventData.date}T${nextEventData.time}`} />
        </>
      )}
      <Spacer space={3} />
      <Box maxWidth={400}>
        <RacesCard
          round={nextRace.round}
          country={nextRace.Circuit.Location.country}
          timezone={timezone}
          circuit={nextRace.Circuit.circuitName}
          events={nextRace.events}
          isNext={true}
          isCompleted={false}
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
        {races.map((e) => {
          const raceEndDate = new Date(`${e.date}T${e.time}`);
          const isCompleted = raceEndDate < new Date();

          return (
            <RacesCard
              key={e.round}
              round={e.round}
              country={e.Circuit.Location.country}
              timezone={timezone}
              circuit={e.Circuit.circuitName}
              events={e.events}
              isNext={nextRace?.round === e.round}
              isCompleted={isCompleted}
            />
          );
        })}
      </DynamicGrid>
    </>
  );
};

export default RacesPage;
