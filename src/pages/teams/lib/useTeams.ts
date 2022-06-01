import useData from '@/lib/useData';
import getTeams, { Team } from './getTeams';

export default function useTeams() {
  return useData(() => getTeams(), []);
}
