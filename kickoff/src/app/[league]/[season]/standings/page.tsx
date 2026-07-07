import { notFound } from 'next/navigation';
import { StandingsTable } from '@/app/components/standings-table';
import { isLeague } from '@/app/config/leagues';
import { getStandings } from '@/app/services/leagueData';
import { leagueMeta } from '@/app/theme/pitch';

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ league: string; season: string }>;
}) {
  const { league, season } = await params;
  if (!isLeague(league)) notFound();

  const standings = await getStandings(league, season);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <h1 className="display mb-4 text-2xl font-bold uppercase tracking-[0.08em] text-ink">
        Tabell
      </h1>
      <div className="rounded-xl border border-line bg-surface p-4">
        <StandingsTable
          data={standings}
          league={league}
          season={season}
          caption={`Tabell, ${leagueMeta[league].name}`}
        />
      </div>
    </main>
  );
}
