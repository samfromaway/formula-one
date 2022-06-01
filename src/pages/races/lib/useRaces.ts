import useData from '@/lib/useData';
import getRaces, { Race } from './getRaces';

export default function useRaces(timezone: string) {
  return useData(() => getRaces(timezone), [timezone]);
}
