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
import type { TeamInfo } from '@/app/types/domain/team';
import {
  dateKeyFromString,
  formatLongDateFromString,
  formatShortDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';
import { outcomeFor } from '@/app/utils/form';
import { matchupPath } from '@/app/utils/leaguePaths';

type Props = {
  matches: MatchInfo[];
  /** Heading level for the per-day date headings. */
  headingLevel?: 'h2' | 'h3' | 'h4';
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
   * League + season for the current view. When set, each team links to its
   * matchup page against the other team of the match.
   */
  league?: League;
  season?: string;
  /**
   * Label upcoming matches with their short date ("25 jul") instead of the
   * kick-off time — for lists that carry no date headings of their own.
   */
  dateInsteadOfTime?: boolean;
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
  dateInsteadOfTime = false,
}: Props) {
  if (matches.length === 0) {
    return <p className="py-6 text-center text-sm text-mute">Inga matcher.</p>;
  }

  const row = (match: MatchInfo) => (
    <li key={match.uuid} className="border-b border-line-soft last:border-b-0">
      <MatchRow
        match={match}
        league={leagueOf?.(match) ?? league}
        chipLeague={leagueOf?.(match)}
        perspective={perspective}
        season={season}
        dateInsteadOfTime={dateInsteadOfTime}
      />
    </li>
  );

  // Without date headings there is nothing to group by — one flat card keeps
  // the list compact instead of splitting it into a box per day.
  if (!showDateHeadings) {
    return (
      <ul className="overflow-hidden rounded-xl border border-line bg-surface">
        {matches.map(row)}
      </ul>
    );
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
          <Heading className="display mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
            {formatLongDateFromString(dayMatches[0].startDateTime)}
          </Heading>
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {dayMatches.map(row)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function MatchRow({
  match,
  league,
  chipLeague,
  perspective,
  season,
  dateInsteadOfTime,
}: {
  match: MatchInfo;
  /** Which league's pages the row links into. */
  league?: League;
  /** Set only in cross-league lists, where the row has to name its league. */
  chipLeague?: League;
  perspective?: string;
  season?: string;
  dateInsteadOfTime?: boolean;
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
              href={matchupPath(league, season, perspective, opponent.code)}
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
            dateInsteadOfTime={dateInsteadOfTime}
          />
        </div>
        {state === 'live' && <LiveTag />}
      </div>
    );
  }

  return (
    <div
      className={`grid items-center gap-2 px-3 py-3 sm:px-4 ${
        chipLeague
          ? 'grid-cols-[auto_1fr_auto_1fr]'
          : 'grid-cols-[1fr_auto_1fr]'
      }`}
    >
      {chipLeague && <LeagueChip league={chipLeague} />}

      {/* Home */}
      <TeamCell
        team={homeTeamInfo.teamInfo}
        opponent={awayTeamInfo.teamInfo}
        league={league}
        season={season}
        align="end"
      />

      {/* Score / kickoff */}
      <MatchCenter match={match} dateInsteadOfTime={dateInsteadOfTime} />

      {/* Away */}
      <TeamCell
        team={awayTeamInfo.teamInfo}
        opponent={homeTeamInfo.teamInfo}
        league={league}
        season={season}
        align="start"
      />

      {state === 'live' && <LiveTag />}
    </div>
  );
}

/**
 * One side of a match row. With a known league the team links to its matchup
 * page against the other team of the match — the clicked team is always the
 * subject, home or away.
 */
function TeamCell({
  team,
  opponent,
  league,
  season,
  align,
}: {
  team: TeamInfo;
  opponent: TeamInfo;
  league?: League;
  season?: string;
  align: 'start' | 'end';
}) {
  const body =
    align === 'end' ? (
      <>
        <span className="hidden sm:inline">{team.long}</span>
        <span className="sm:hidden">{team.short}</span>
        <TeamBadge team={team} size="sm" />
      </>
    ) : (
      <>
        <TeamBadge team={team} size="sm" />
        <span className="hidden sm:inline">{team.long}</span>
        <span className="sm:hidden">{team.short}</span>
      </>
    );

  const layout =
    align === 'end'
      ? 'justify-end text-right'
      : // Keeps the away side from stretching past its label.
        'justify-start';

  if (!league) {
    return (
      <span
        className={`flex items-center gap-2 text-sm font-medium text-ink ${layout}`}
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={matchupPath(league, season, team.code, opponent.code)}
      className={`flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent ${layout}`}
    >
      {body}
    </Link>
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
  dateInsteadOfTime = false,
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
  /** Short date instead of kick-off time for upcoming matches. */
  dateInsteadOfTime?: boolean;
}) {
  const { homeTeamInfo, awayTeamInfo, state } = match;
  const aggregate = <AggregateLine match={match} />;

  if (state === 'not-started') {
    return (
      <span className="flex flex-col items-center gap-0.5">
        <span className="flex items-baseline gap-1.5">
          <span className="num whitespace-nowrap rounded-md bg-surface-3 px-2.5 py-1 text-sm font-semibold text-soft">
            {dateInsteadOfTime
              ? formatShortDateFromString(match.startDateTime)
              : formatTimeFromString(match.startDateTime)}
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
