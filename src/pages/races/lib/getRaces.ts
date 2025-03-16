import getData, { RaceData } from '@/lib/getData';

export type Races = Awaited<ReturnType<typeof getData>>['data'];
export type Race = Races[number];
export type RaceEvent = Race['events'][number];

export type RaceEventWTimeZone = RaceEvent & {
  timezoneTime: string;
  timezoneDate: string;
};

export type RaceWTimezone = (Race & {
  events: RaceEventWTimeZone[];
})[];
type GetRaces = { data: Race[] | null; errors: string | null };

export default async function getRaces(): Promise<GetRaces> {
  const { data, errors } = await getData();

  return { data: data, errors };
}
