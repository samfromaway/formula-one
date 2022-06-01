import type { NextPage } from 'next';
import { TeamsPage } from '@/pages';
import PageFallback from '@/components/layout/PageFallback';
import useTeams from '@/pages/teams/lib/useTeams';

const Teams: NextPage = () => {
  const { data, errors, isLoading } = useTeams();

  return (
    <PageFallback isLoading={isLoading} errors={errors}>
      <TeamsPage teams={data} />
    </PageFallback>
  );
};

export default Teams;
