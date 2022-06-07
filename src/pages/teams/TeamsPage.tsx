import Grid from '@mui/material/Grid';
import TeamCard from './ui/TeamCard';
import { Team } from './lib/getTeams';
import { DynamicGrid } from '@/components/ui';

type TeamsPageProps = { teams: Team[] | null };

export default function TeamsPage({ teams }: TeamsPageProps) {
  if (!teams || teams.length === 0) return null;

  return (
    <DynamicGrid spacing={4} maxColumns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>
      {teams.map((e) => (
        <TeamCard key={e.id} img={e.logo} name={e.name} />
      ))}
    </DynamicGrid>
  );
}
