import { notFound } from 'next/navigation';
import { StatsTable } from '@/app/components/stats-table';
import { type Tab, Tabs } from '@/app/components/tabs';
import { isLeague } from '@/app/config/leagues';
import { getKeeperStats, getPlayerStats } from '@/app/services/leagueData';
import { leagueMeta } from '@/app/theme/pitch';

export default async function StatsPage({
  params,
}: {
  params: Promise<{ league: string; season: string }>;
}) {
  const { league, season } = await params;
  if (!isLeague(league)) notFound();

  const leagueName = leagueMeta[league].name;
  const [byGoals, byAssists, byCards, keepers] = await Promise.all([
    getPlayerStats(league, season, 'goals'),
    getPlayerStats(league, season, 'assists'),
    getPlayerStats(league, season, 'cards'),
    getKeeperStats(league),
  ]);

  const tabs: Tab[] = [
    {
      id: 'skyttar',
      label: 'Skyttar',
      content: (
        <StatsTable
          dataColumns={byGoals.dataColumns}
          stats={byGoals.stats}
          caption={`Skytteliga, ${leagueName}`}
        />
      ),
    },
    {
      id: 'assist',
      label: 'Assist',
      content: (
        <StatsTable
          dataColumns={byAssists.dataColumns}
          stats={byAssists.stats}
          caption={`Assistliga, ${leagueName}`}
        />
      ),
    },
    {
      id: 'kort',
      label: 'Kort',
      content: (
        <StatsTable
          dataColumns={byCards.dataColumns.filter((c) =>
            ['GP', 'YC', 'RC'].includes(c.name),
          )}
          stats={byCards.stats}
          caption={`Kort, ${leagueName}`}
        />
      ),
    },
  ];

  if (keepers) {
    tabs.push({
      id: 'malvakter',
      label: 'Målvakter',
      content: (
        <StatsTable
          dataColumns={keepers.dataColumns}
          stats={keepers.stats}
          caption={`Målvakter, ${leagueName}`}
        />
      ),
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <h1 className="display mb-4 text-2xl font-bold uppercase tracking-[0.08em] text-ink">
        Statistik
      </h1>
      <div className="rounded-xl border border-line bg-surface p-4">
        <Tabs ariaLabel="Statistikkategorier" tabs={tabs} />
      </div>
    </main>
  );
}
