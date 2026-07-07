import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MatchList } from '@/app/components/match-list';
import { ALL_LEAGUES } from '@/app/config/leagues';
import { getMatches } from '@/app/services/leagueData';
import { leagueAccent, leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import {
  leagueBasePath,
  standingsPath,
  statsPath,
} from '@/app/utils/leaguePaths';

// Schedules are time-relative and fetched live; render per request.
export const dynamic = 'force-dynamic';

/** Next three upcoming matches; a failing provider hides its league here. */
async function upcomingFor(league: League): Promise<MatchInfo[]> {
  try {
    const { matches } = await getMatches(league);
    return matches
      .filter((m) => m.state === 'not-started')
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
      .slice(0, 3);
  } catch (error) {
    console.error(`Failed to fetch upcoming matches for ${league}:`, error);
    return [];
  }
}

export default async function Home() {
  const upcomingByLeague = await Promise.all(ALL_LEAGUES.map(upcomingFor));
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line-strong">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center px-4 md:px-6">
          <span className="display text-xl font-bold uppercase tracking-[0.12em]">
            Matchday
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <h1 className="display text-3xl font-bold uppercase tracking-[0.08em]">
          Matchday
        </h1>
        <p className="mt-2 max-w-xl text-soft">
          Spelscheman, tabeller och statistik för Allsvenskan, Premier League
          och Champions League.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ALL_LEAGUES.map((league) => (
            <div
              key={league}
              style={{ '--accent': leagueAccent[league] } as CSSProperties}
              className="rounded-xl border border-line border-t-2 border-t-accent bg-surface p-4"
            >
              <h2 className="display text-lg font-bold uppercase tracking-[0.08em]">
                <Link
                  href={leagueBasePath(league)}
                  className="transition-colors hover:text-accent"
                >
                  {leagueMeta[league].name}
                </Link>
              </h2>
              <nav
                aria-label={`Genvägar ${leagueMeta[league].name}`}
                className="mt-3 flex gap-4 text-sm"
              >
                <Link
                  href={leagueBasePath(league)}
                  className="text-soft transition-colors hover:text-accent"
                >
                  Matcher
                </Link>
                <Link
                  href={standingsPath(league)}
                  className="text-soft transition-colors hover:text-accent"
                >
                  Tabell
                </Link>
                <Link
                  href={statsPath(league)}
                  className="text-soft transition-colors hover:text-accent"
                >
                  Statistik
                </Link>
              </nav>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="display mb-4 text-xl font-bold uppercase tracking-[0.08em]">
            Kommande matcher
          </h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {ALL_LEAGUES.map((league, i) => {
              const upcoming = upcomingByLeague[i];
              return (
                <section
                  key={league}
                  style={{ '--accent': leagueAccent[league] } as CSSProperties}
                >
                  <h3 className="display mb-2 text-sm font-bold uppercase tracking-[0.1em] text-accent">
                    <Link
                      href={leagueBasePath(league)}
                      className="transition-colors hover:text-ink"
                    >
                      {leagueMeta[league].name}
                    </Link>
                  </h3>
                  <MatchList matches={upcoming} showDateHeadings={false} />
                </section>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-line py-8">
        <p className="text-center text-sm text-mute">
          Fixturdata visas tills liga-API:er kopplas på.
        </p>
      </footer>
    </div>
  );
}
