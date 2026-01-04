import { mainUrl } from './dbConnection';

type Location = {
  lat: string;
  long: string;
  locality: string;
  country: string;
};

type Circuit = {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
};

type Session = {
  date: string;
  time: string;
};

export type RaceData = {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  FirstPractice: Session;
  SecondPractice: Session;
  ThirdPractice: Session;
  Qualifying: Session;
  Sprint: Session;
  SprintQualifying: Session;
};

export default async function getData() {
  const res = await fetch(mainUrl, {
    method: 'GET',
  });
  const data = await res.json();

  const base = data.MRData;

  const races: RaceData[] = base.RaceTable.Races;

  const currentRaces = races.filter((e) => e.season === '2026');

  const raceData = currentRaces.map((e) => ({
    ...e,
    events: [
      ...(e.FirstPractice
        ? [{ ...e.FirstPractice, type: 'First Practice' }]
        : []),
      ...(e.SecondPractice
        ? [{ ...e.SecondPractice, type: 'Second Practice' }]
        : []),
      ...(e.ThirdPractice
        ? [{ ...e.ThirdPractice, type: 'Third Practice' }]
        : []),
      ...(e.SprintQualifying
        ? [{ ...e.SprintQualifying, type: 'Sprint Qualifying' }]
        : []),
      ...(e.Sprint ? [{ ...e.Sprint, type: 'Sprint' }] : []),
      ...(e.Qualifying ? [{ ...e.Qualifying, type: 'Qualifying' }] : []),
      { date: e.date, time: e.time, type: 'Race' },
    ],
  }));

  return { data: raceData, errors: null };
}
