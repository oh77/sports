import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MatchList } from '@/app/components/match-list';
import { StandingsTable } from '@/app/components/standings-table';
import { StatsTable } from '@/app/components/stats-table';
import { isLeague } from '@/app/config/leagues';
import {
  getMatches,
  getPlayerStats,
  getStandings,
} from '@/app/services/leagueData';
import { leagueMeta } from '@/app/theme/pitch';
import { standingsPath, statsPath } from '@/app/utils/leaguePaths';

export default async function LeagueOverviewPage({
  params,
}: {
  params: Promise<{ league: string; season: string }>;
}) {
  const { league, season } = await params;
  if (!isLeague(league)) notFound();

  const [{ matches }, standings, playerStats] = await Promise.all([
    getMatches(league, season),
    getStandings(league, season),
    getPlayerStats(league, season, 'goals'),
  ]);

  const live = matches.filter((m) => m.state === 'live');
  const upcoming = matches
    .filter((m) => m.state === 'not-started')
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
    .slice(0, 8);
  const previous = matches
    .filter((m) => m.state === 'finished')
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
    .slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <h1 className="sr-only">{leagueMeta[league].name} – Matcher</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {live.length > 0 && (
            <section>
              <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
                Pågående
              </h2>
              <MatchList matches={live} showDateHeadings={false} />
            </section>
          )}

          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Kommande matcher
            </h2>
            <MatchList matches={upcoming} />
          </section>

          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Senast spelade
            </h2>
            <MatchList matches={previous} />
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="display text-lg font-bold uppercase tracking-[0.08em] text-ink">
                Tabell
              </h2>
              <Link
                href={standingsPath(league, season)}
                className="text-sm text-accent transition-colors hover:text-ink"
              >
                Hela tabellen
              </Link>
            </div>
            <StandingsTable
              data={standings}
              league={league}
              season={season}
              caption={`Tabell, ${leagueMeta[league].name}`}
              compact
            />
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="display text-lg font-bold uppercase tracking-[0.08em] text-ink">
                Skytteliga
              </h2>
              <Link
                href={statsPath(league, season)}
                className="text-sm text-accent transition-colors hover:text-ink"
              >
                All statistik
              </Link>
            </div>
            <StatsTable
              dataColumns={playerStats.dataColumns.filter((c) =>
                ['GP', 'G'].includes(c.name),
              )}
              stats={playerStats.stats}
              caption={`Skytteliga, ${leagueMeta[league].name}`}
              limit={5}
            />
          </section>
        </aside>
      </div>
    </main>
  );
}
