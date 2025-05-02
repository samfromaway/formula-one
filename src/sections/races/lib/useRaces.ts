import useData from '@/lib/useData';
import getRaces from './getRaces';

export default function useRaces() {
  return useData(() => getRaces(), []);
}
