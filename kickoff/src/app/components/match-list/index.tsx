import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { OUTCOME_LABEL, OUTCOME_TEXT } from '@/app/components/form-markers';
import { AggregateLine, MatchMetaRow } from '@/app/components/match-meta';
import { TeamBadge } from '@/app/components/team-badge';
import { leagueAccent, leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import type { MatchOutcome } from '@/app/types/domain/standings';
import {
  dateKeyFromString,
  formatLongDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';
import { outcomeFor } from '@/app/utils/form';
import { teamPath } from '@/app/utils/leaguePaths';

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
  /**
   * Team-page mode: the code of the page's team. Rows show only the opponent
   * plus a Hemma/Borta chip, and skip the finished-status tag.
   */
  perspective?: string;
  /**
   * League + season for the current view. When set in perspective mode, the
   * opponent links to its own team page.
   */
  league?: League;
  season?: string;
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
  perspective,
  league,
  season,
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
                <MatchRow
                  match={match}
                  league={leagueOf?.(match) ?? league}
                  perspective={perspective}
                  season={season}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function MatchRow({
  match,
  league,
  perspective,
  season,
}: {
  match: MatchInfo;
  league?: League;
  perspective?: string;
  season?: string;
}) {
  const { homeTeamInfo, awayTeamInfo, state } = match;

  if (perspective) {
    const isHome = homeTeamInfo.teamInfo.code === perspective;
    const opponent = isHome ? awayTeamInfo.teamInfo : homeTeamInfo.teamInfo;
    const outcome =
      state === 'finished' ? outcomeFor(perspective, match) : undefined;
    const opponentBody = (
      <>
        <TeamBadge team={opponent} size="sm" />
        <span className="hidden sm:inline">{opponent.long}</span>
        <span className="sm:hidden">{opponent.short}</span>
      </>
    );
    return (
      <div className="px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <SideChip home={isHome} />
          {league ? (
            <Link
              href={teamPath(league, season, opponent.code)}
              className="flex flex-1 items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
            >
              {opponentBody}
            </Link>
          ) : (
            <span className="flex flex-1 items-center gap-2 text-sm font-medium text-ink">
              {opponentBody}
            </span>
          )}
          <MatchCenter
            match={match}
            showStatusTag={false}
            outcome={outcome}
            inlineAggregate
          />
        </div>
        {state === 'live' && <LiveTag />}
      </div>
    );
  }

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

      {state === 'live' && <LiveTag />}
    </div>
  );
}

function LiveTag() {
  return (
    <span className="col-span-full flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-loss">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-loss"
      />
      Live
    </span>
  );
}

/** Hemma/Borta marker for team-page rows. */
function SideChip({ home }: { home: boolean }) {
  return (
    <span
      title={home ? 'Hemmamatch' : 'Bortamatch'}
      className="display flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-3 text-[10px] font-bold uppercase tracking-wide text-soft"
    >
      <span aria-hidden="true">{home ? 'H' : 'B'}</span>
      <span className="sr-only">{home ? 'Hemma' : 'Borta'}</span>
    </span>
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
        className={`relative flex h-6 w-9 shrink-0 items-center justify-center rounded ${
          logoOnDark ? '' : 'bg-white/90'
        }`}
      >
        <Image
          src={logo}
          alt={name}
          fill
          sizes="36px"
          className="object-contain p-0.5"
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

function MatchCenter({
  match,
  showStatusTag = true,
  outcome,
  inlineAggregate = false,
}: {
  match: MatchInfo;
  showStatusTag?: boolean;
  /** Colours the score as a win/draw/loss, from one team's perspective. */
  outcome?: MatchOutcome;
  /**
   * Sets the tie total beside the score instead of under it — keeps the
   * single-opponent rows on team pages from growing a line per annotation.
   */
  inlineAggregate?: boolean;
}) {
  const { homeTeamInfo, awayTeamInfo, state } = match;
  const aggregate = <AggregateLine match={match} />;

  if (state === 'not-started') {
    return (
      <span className="flex flex-col items-center gap-0.5">
        <span className="flex items-baseline gap-1.5">
          <span className="num rounded-md bg-surface-3 px-2.5 py-1 text-sm font-semibold text-soft">
            {formatTimeFromString(match.startDateTime)}
          </span>
          {inlineAggregate && aggregate}
        </span>
        <MatchMetaRow match={match} />
        {!inlineAggregate && aggregate}
      </span>
    );
  }

  const suffix = match.penalties
    ? 'e. str.'
    : match.extraTime
      ? 'e. förl.'
      : null;

  const hasPenalties =
    homeTeamInfo.penaltyScore !== undefined &&
    awayTeamInfo.penaltyScore !== undefined;

  return (
    <span className="flex flex-col items-center">
      <span className="flex items-baseline gap-1.5 px-2">
        <span
          className={`num display text-lg font-bold ${
            outcome ? OUTCOME_TEXT[outcome] : 'text-ink'
          }`}
        >
          {homeTeamInfo.score}–{awayTeamInfo.score}
          {outcome && (
            <span className="sr-only"> ({OUTCOME_LABEL[outcome]})</span>
          )}
        </span>
        {inlineAggregate && aggregate}
      </span>
      {state === 'finished' && showStatusTag && (
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-dim">
          Slut
        </span>
      )}
      <MatchMetaRow match={match} />
      {!inlineAggregate && aggregate}
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
    </span>
  );
}
