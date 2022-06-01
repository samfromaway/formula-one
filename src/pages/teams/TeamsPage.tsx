import Grid from '@mui/material/Grid';
import TeamCard from './ui/TeamCard';
import { Team } from './lib/getTeams';

type TeamsPageProps = { teams: Team[] };

export default function TeamsPage({ teams }: TeamsPageProps) {
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
