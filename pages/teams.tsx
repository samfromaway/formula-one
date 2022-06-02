import type { NextPage } from 'next';
import { TeamsPage } from '@/pages';
import PageFallback from '@/components/layout/PageFallback';
import useTeams from '@/pages/teams/lib/useTeams';
import Head from 'next/head';

const Teams: NextPage = () => {
  const { data, errors, isLoading } = useTeams();

  return (
    <>
      <Head>
        <title>Formula 1: Teams</title>
      </Head>
      <PageFallback isLoading={isLoading} errors={errors}>
        <TeamsPage teams={data} />
      </PageFallback>
    </>
  );
};

export default Teams;
