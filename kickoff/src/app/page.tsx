import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MatchList } from '@/app/components/match-list';
import { ALL_LEAGUES } from '@/app/config/leagues';
import { getMatches } from '@/app/services/leagueData';
import { leagueAccent, leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import {
  dateKeyFromString,
  formatWeekdayShortDateFromString,
  todayDateKey,
} from '@/app/utils/dateUtils';
import {
  leagueBasePath,
  standingsPath,
  statsPath,
} from '@/app/utils/leaguePaths';

// Schedules are time-relative and fetched live; render per request.
export const dynamic = 'force-dynamic';

/** At least this many upcoming matches on the landing page. */
const MIN_UPCOMING = 10;

/**
 * Combined matches across all leagues, chronological, starting from today.
 * Today's matches stay on the list all day regardless of state (live and
 * finished included), so the day's results remain visible until midnight.
 * Whole days are included: once the minimum number of upcoming matches is
 * reached, the current day is still completed, so the last day shown is
 * never truncated.
 */
async function combinedMatches(): Promise<{
  matches: MatchInfo[];
  leagueByMatch: Map<MatchInfo, League>;
  nextRoundByLeague: Map<League, string>;
}> {
  const perLeague = await Promise.all(
    ALL_LEAGUES.map(async (league) => {
      try {
        return { league, matches: (await getMatches(league)).matches };
      } catch (error) {
        console.error(`Failed to fetch matches for ${league}:`, error);
        return { league, matches: [] };
      }
    }),
  );

  const today = todayDateKey();

  // The next round per league: the earliest kick-off of the next upcoming
  // (or ongoing) match day.
  const nextRoundByLeague = new Map<League, string>();
  for (const { league, matches } of perLeague) {
    const next = matches
      .filter(
        (m) =>
          m.state === 'live' || dateKeyFromString(m.startDateTime) >= today,
      )
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))[0];
    if (next) nextRoundByLeague.set(league, next.startDateTime);
  }

  const leagueByMatch = new Map<MatchInfo, League>();
  const relevant = perLeague
    .flatMap(({ league, matches }) =>
      matches
        .filter(
          (m) =>
            m.state === 'live' || dateKeyFromString(m.startDateTime) >= today,
        )
        .map((m) => {
          leagueByMatch.set(m, league);
          return m;
        }),
    )
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  const selected: MatchInfo[] = [];
  let upcomingCount = 0;
  let currentDay = '';
  for (const match of relevant) {
    const day = dateKeyFromString(match.startDateTime);
    if (upcomingCount >= MIN_UPCOMING && day !== currentDay) break;
    selected.push(match);
    if (match.state === 'not-started') upcomingCount++;
    currentDay = day;
  }

  return { matches: selected, leagueByMatch, nextRoundByLeague };
}

export default async function Home() {
  const { matches, leagueByMatch, nextRoundByLeague } = await combinedMatches();

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
          Spelscheman, tabeller och statistik för Allsvenskan, Premier League,
          Champions League och Conference League.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_LEAGUES.map((league) => (
            <div
              key={league}
              style={{ '--accent': leagueAccent[league] } as CSSProperties}
              className="rounded-xl border border-line border-t-2 border-t-accent bg-surface p-4"
            >
              <h2 className="display text-lg font-bold uppercase tracking-[0.08em]">
                <Link
                  href={leagueBasePath(league)}
                  className="flex items-center gap-2.5 transition-colors hover:text-accent"
                >
                  {leagueMeta[league].logo && (
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-1 ${
                        leagueMeta[league].logoOnDark
                          ? 'bg-surface-3'
                          : 'bg-white/90'
                      }`}
                    >
                      <Image
                        src={leagueMeta[league].logo}
                        alt=""
                        aria-hidden="true"
                        width={28}
                        height={28}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  )}
                  {leagueMeta[league].name}
                </Link>
              </h2>
              {nextRoundByLeague.has(league) && (
                <p className="mt-2 text-sm text-soft">
                  <span className="text-mute">Nästa omgång: </span>
                  <span className="capitalize text-ink">
                    {formatWeekdayShortDateFromString(
                      nextRoundByLeague.get(league) as string,
                    )}
                  </span>
                </p>
              )}
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
            Dagens och kommande matcher
          </h2>
          <div className="mx-auto max-w-3xl">
            <MatchList
              matches={matches}
              leagueOf={(match) => leagueByMatch.get(match)}
            />
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-line py-8">
        <nav
          aria-label="Ligor och turneringar"
          className="mx-auto max-w-7xl px-4 md:px-6"
        >
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {ALL_LEAGUES.map((league) => (
              <li key={league}>
                <Link
                  href={leagueBasePath(league)}
                  title={leagueMeta[league].name}
                  className="flex opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                >
                  {leagueMeta[league].logo && (
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md p-1.5 ${
                        leagueMeta[league].logoOnDark
                          ? 'bg-surface-3'
                          : 'bg-white/90'
                      }`}
                    >
                      <Image
                        src={leagueMeta[league].logo as string}
                        alt=""
                        aria-hidden="true"
                        width={36}
                        height={36}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  )}
                  <span className="sr-only">{leagueMeta[league].name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
}
