import Image from 'next/image';
import type { CSSProperties } from 'react';
import { TeamBadge } from '@/app/components/team-badge';
import { leagueAccent, leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import {
  dateKeyFromString,
  formatLongDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';

type Props = {
  matches: MatchInfo[];
  /** Heading level for the per-day date headings. */
  headingLevel?: 'h2' | 'h3';
  showDateHeadings?: boolean;
  /**
   * For cross-league lists: resolves which league a match belongs to, shown
   * as an accent-colored chip on each row.
   */
  leagueOf?: (match: MatchInfo) => League | undefined;
};

/**
 * Match rows grouped per day. Handles all three match states: kick-off time
 * for upcoming matches, a live indicator, and final scores (with extra
 * time/penalty annotations for knockout matches).
 */
export function MatchList({
  matches,
  headingLevel: Heading = 'h3',
  showDateHeadings = true,
  leagueOf,
}: Props) {
  if (matches.length === 0) {
    return <p className="py-6 text-center text-sm text-mute">Inga matcher.</p>;
  }

  const byDay = new Map<string, MatchInfo[]>();
  for (const match of matches) {
    const key = dateKeyFromString(match.startDateTime);
    const list = byDay.get(key) ?? [];
    list.push(match);
    byDay.set(key, list);
  }

  return (
    <div className="flex flex-col gap-5">
      {Array.from(byDay.entries()).map(([day, dayMatches]) => (
        <section key={day}>
          {showDateHeadings && (
            <Heading className="display mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
              {formatLongDateFromString(dayMatches[0].startDateTime)}
            </Heading>
          )}
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {dayMatches.map((match) => (
              <li
                key={match.uuid}
                className="border-b border-line-soft last:border-b-0"
              >
                <MatchRow match={match} league={leagueOf?.(match)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function MatchRow({ match, league }: { match: MatchInfo; league?: League }) {
  const { homeTeamInfo, awayTeamInfo, state } = match;

  return (
    <div
      className={`grid items-center gap-2 px-3 py-3 sm:px-4 ${
        league ? 'grid-cols-[auto_1fr_auto_1fr]' : 'grid-cols-[1fr_auto_1fr]'
      }`}
    >
      {league && <LeagueChip league={league} />}

      {/* Home */}
      <span className="flex items-center justify-end gap-2 text-right text-sm font-medium text-ink">
        <span className="hidden sm:inline">{homeTeamInfo.teamInfo.long}</span>
        <span className="sm:hidden">{homeTeamInfo.teamInfo.short}</span>
        <TeamBadge team={homeTeamInfo.teamInfo} size="sm" />
      </span>

      {/* Score / kickoff */}
      <MatchCenter match={match} />

      {/* Away */}
      <span className="flex items-center gap-2 text-sm font-medium text-ink">
        <TeamBadge team={awayTeamInfo.teamInfo} size="sm" />
        <span className="hidden sm:inline">{awayTeamInfo.teamInfo.long}</span>
        <span className="sm:hidden">{awayTeamInfo.teamInfo.short}</span>
      </span>

      {state === 'live' && (
        <span className="col-span-full flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-loss">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-loss"
          />
          Live
        </span>
      )}
    </div>
  );
}

function LeagueChip({ league }: { league: League }) {
  const { name, short, logo, logoOnDark } = leagueMeta[league];

  if (logo) {
    // Logos drawn for light surfaces get a light chip; dark-surface variants
    // sit directly on the theme background.
    return (
      <span
        title={name}
        className={`flex h-6 w-9 shrink-0 items-center justify-center rounded p-0.5 ${
          logoOnDark ? '' : 'bg-white/90'
        }`}
      >
        <Image
          src={logo}
          alt={name}
          width={28}
          height={20}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      style={{ '--accent': leagueAccent[league] } as CSSProperties}
      className="display flex h-6 w-9 shrink-0 items-center justify-center rounded bg-surface-3 text-[10px] font-bold uppercase tracking-wide text-accent"
    >
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}

function MatchCenter({ match }: { match: MatchInfo }) {
  const { homeTeamInfo, awayTeamInfo, state } = match;

  if (state === 'not-started') {
    return (
      <span className="flex flex-col items-center gap-0.5">
        <span className="num rounded-md bg-surface-3 px-2.5 py-1 text-sm font-semibold text-soft">
          {formatTimeFromString(match.startDateTime)}
        </span>
        {match.qualifying && <QualifyingTag />}
      </span>
    );
  }

  const suffix = match.penalties
    ? 'e. str.'
    : match.extraTime
      ? 'e. förl.'
      : null;

  const hasAggregate =
    homeTeamInfo.aggregateScore !== undefined &&
    awayTeamInfo.aggregateScore !== undefined;
  const hasPenalties =
    homeTeamInfo.penaltyScore !== undefined &&
    awayTeamInfo.penaltyScore !== undefined;

  return (
    <span className="flex flex-col items-center">
      <span className="num display px-2 text-lg font-bold text-ink">
        {homeTeamInfo.score}–{awayTeamInfo.score}
      </span>
      {hasAggregate && (
        <span
          className="num text-[11px] text-dim"
          title="Totalt över två matcher"
        >
          (tot. {homeTeamInfo.aggregateScore}–{awayTeamInfo.aggregateScore})
        </span>
      )}
      {hasPenalties && (
        <span className="num text-[11px] text-dim" title="Straffar">
          (str. {homeTeamInfo.penaltyScore}–{awayTeamInfo.penaltyScore})
        </span>
      )}
      {suffix && (
        <span className="text-[11px] uppercase tracking-wide text-dim">
          {suffix}
        </span>
      )}
      {match.qualifying && <QualifyingTag />}
    </span>
  );
}

function QualifyingTag() {
  return (
    <span
      title="Kvalmatch"
      className="text-[10px] font-bold uppercase tracking-[0.08em] text-dim"
    >
      Kval
    </span>
  );
}
