import getData, { RaceData } from '@/lib/getData';

export type RaceEvent = { type: string; date: string; timezone: string };

export type MapedRace = RaceData & {
  events: RaceEvent[];
};

export type Races = Awaited<ReturnType<typeof getData>>['data'];
export type Race = Races[number];

type GetRaces = { data: Race[] | null; errors: string | null };

export default async function getRaces(): Promise<GetRaces> {
  const { data, errors } = await getData();

  return { data: data, errors };
}
