import Grid from '@mui/material/Grid';
import TeamCard from './ui/TeamCard';
import { Team } from './lib/getTeams';

type TeamsPageProps = { teams: Team[] | null };

export default function TeamsPage({ teams }: TeamsPageProps) {
  if (!teams || teams.length === 0) return null;

  return (
    <Grid container spacing={4}>
      {teams.map((e) => (
        <Grid item xs={2} key={e.id}>
          <TeamCard img={e.logo} name={e.name} />
        </Grid>
      ))}
    </Grid>
  );
}
