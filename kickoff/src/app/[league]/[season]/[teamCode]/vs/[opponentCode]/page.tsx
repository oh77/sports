import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FormMarkers } from '@/app/components/form-markers';
import { MatchList } from '@/app/components/match-list';
import { AggregateLine, MatchMetaRow } from '@/app/components/match-meta';
import { MatchupTable, matchupRows } from '@/app/components/matchup-table';
import { TeamBadge } from '@/app/components/team-badge';
import { isLeague } from '@/app/config/leagues';
import {
  getMatches,
  getStandings,
  getTeamLeaders,
  getTeams,
  type TeamLeaders,
} from '@/app/services/leagueData';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import type { PlayerStats } from '@/app/types/domain/player-stats';
import type {
  MatchOutcome,
  SideRecord,
  TeamStanding,
} from '@/app/types/domain/standings';
import type { TeamCountry, TeamInfo } from '@/app/types/domain/team';
import {
  dateKeyFromString,
  formatLongDateFromString,
  formatTimeFromString,
  todayDateKey,
} from '@/app/utils/dateUtils';
import { outcomeFor } from '@/app/utils/form';
import { teamCodeMatches, teamPath } from '@/app/utils/leaguePaths';

/**
 * Matchup page for two teams: their meeting as the hero, the table around
 * them, and a column each of recent results and coming matches. Both route
 * codes name the same page whichever way round they are — the fixture, not
 * the URL, decides which team is home.
 */
export default async function MatchupPage({
  params,
}: {
  params: Promise<{
    league: string;
    season: string;
    teamCode: string;
    opponentCode: string;
  }>;
}) {
  const { league, season, teamCode, opponentCode } = await params;
  if (!isLeague(league)) notFound();

  const [teams, { matches }] = await Promise.all([
    getTeams(league, season),
    getMatches(league, season),
  ]);

  const team = teams.find((t) => teamCodeMatches(t.code, teamCode));
  const opponent = teams.find((t) => teamCodeMatches(t.code, opponentCode));
  if (!team || !opponent || team.code === opponent.code) notFound();

  // Every meeting between the two teams, home or away: the next one is the
  // hero, the played ones are listed under it with their results.
  const { next, played } = headToHead(team.code, opponent.code, matches);
  const isToday =
    !!next && dateKeyFromString(next.startDateTime) === todayDateKey();

  // Columns follow the fixture, not the URL: the home team goes first. With
  // no fixture at all to go by, the URL order stands.
  const reference = next ?? played[0];
  const [homeSide, awaySide] =
    reference?.homeTeamInfo.teamInfo.code === opponent.code
      ? [opponent, team]
      : [team, opponent];
  const sides = [homeSide, awaySide].map((t) => teamSide(t, matches));

  const matchup = await matchupData(league, season, homeSide, awaySide);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <h1 className="sr-only">
        {team.full} mot {opponent.full}
      </h1>

      <div className="flex flex-col gap-8">
        {next ? (
          <MatchHero
            match={next}
            isToday={isToday}
            comparison={matchup.comparison}
            league={league}
            season={season}
          />
        ) : (
          <NoMeetingHero
            home={homeSide}
            away={awaySide}
            hasPlayed={played.length > 0}
            league={league}
            season={season}
          />
        )}

        {played.length > 0 && (
          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              {played.length > 1 ? 'Tidigare möten' : 'Tidigare möte'}
            </h2>
            <MatchList
              matches={played}
              league={league}
              season={season}
              headingLevel="h3"
            />
          </section>
        )}

        {matchup.tableRows.length > 0 && (
          <section aria-label="Läget i tabellen">
            <MatchupTable
              rows={matchup.tableRows}
              highlight={[homeSide.code, awaySide.code]}
              league={league}
              season={season}
              caption="Tabellutdrag kring lagen i matchen"
            />
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {sides.map((side) => (
            <TeamColumn
              key={side.team.code}
              side={side}
              league={league}
              season={season}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * The two teams' meetings this season, either way round: the next one still
 * to be played (an ongoing match counts, it stays the hero until it ends) and
 * the ones already played, most recent first. Both can be empty — the leagues
 * with a knockout format pair most teams never.
 */
function headToHead(
  a: string,
  b: string,
  matches: MatchInfo[],
): { next?: MatchInfo; played: MatchInfo[] } {
  const between = matches
    .filter((m) => {
      const home = m.homeTeamInfo.teamInfo.code;
      const away = m.awayTeamInfo.teamInfo.code;
      return (home === a && away === b) || (home === b && away === a);
    })
    .sort((x, y) => x.startDateTime.localeCompare(y.startDateTime));

  return {
    next: between.find((m) => m.state !== 'finished'),
    played: between.filter((m) => m.state === 'finished').reverse(),
  };
}

/** How many matches each team's columns hold. */
const PREVIOUS_COUNT = 7;
const UPCOMING_COUNT = 3;

/** One team's slice of the season: recent results, next matches, form. */
interface TeamSide {
  team: TeamInfo;
  /** Most recent first. */
  previous: MatchInfo[];
  /** Next kick-off first. */
  upcoming: MatchInfo[];
  /** Last five results, oldest first. */
  form: MatchOutcome[];
}

function teamSide(team: TeamInfo, matches: MatchInfo[]): TeamSide {
  const own = matches.filter(
    (m) =>
      m.homeTeamInfo.teamInfo.code === team.code ||
      m.awayTeamInfo.teamInfo.code === team.code,
  );

  const previous = own
    .filter((m) => m.state === 'finished')
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
    .slice(0, PREVIOUS_COUNT);
  const upcoming = own
    .filter((m) => m.state === 'not-started')
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
    .slice(0, UPCOMING_COUNT);
  const form = previous
    .slice(0, 5)
    .map((m) => outcomeFor(team.code, m))
    .reverse();

  return { team, previous, upcoming, form };
}

/** Both teams get the same column: badge, name and form over their matches. */
function TeamColumn({
  side,
  league,
  season,
}: {
  side: TeamSide;
  league: League;
  season: string;
}) {
  const { team, previous, upcoming, form } = side;

  return (
    <section aria-label={team.full} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-soft pb-3">
        <TeamBadge team={team} size="sm" />
        <h2 className="display text-base font-bold uppercase tracking-[0.08em] text-ink">
          {team.long}
        </h2>
        {form.length > 0 && <FormMarkers form={form} />}
      </div>

      <div>
        <h3 className="display mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
          Senaste matcherna
        </h3>
        <MatchList
          matches={previous}
          perspective={team.code}
          league={league}
          season={season}
          showDateHeadings={false}
        />
      </div>

      <div>
        <h3 className="display mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
          Kommande matcher
        </h3>
        <MatchList
          matches={upcoming}
          perspective={team.code}
          league={league}
          season={season}
          showDateHeadings={false}
          dateInsteadOfTime
        />
      </div>
    </section>
  );
}

/** One side of the head-to-head comparison under the hero. */
interface TeamComparison {
  leaders?: TeamLeaders;
  /** Home record for the home team, away record for the away team. */
  record?: SideRecord;
}

interface MatchComparison {
  home: TeamComparison;
  away: TeamComparison;
}

/**
 * Standings-derived context for the two teams: the head-to-head comparison
 * (top scorer/assist, home/away records) and a table excerpt around them.
 * Fetch failures degrade to empty data — the page must render regardless.
 */
async function matchupData(
  league: League,
  season: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo,
): Promise<{ comparison: MatchComparison; tableRows: TeamStanding[] }> {
  const [standings, leaders] = await Promise.all([
    getStandings(league, season).catch((error) => {
      console.error(`Failed to fetch standings for ${league}:`, error);
      return undefined;
    }),
    getTeamLeaders(league, season, [homeTeam, awayTeam]).catch((error) => {
      console.error(`Failed to fetch team leaders for ${league}:`, error);
      return undefined;
    }),
  ]);

  const standingOf = (code: string) =>
    standings?.stats.find((s) => s.info.code === code);

  return {
    comparison: {
      home: {
        leaders: leaders?.get(homeTeam.code),
        record: standingOf(homeTeam.code)?.homeRecord,
      },
      away: {
        leaders: leaders?.get(awayTeam.code),
        record: standingOf(awayTeam.code)?.awayRecord,
      },
    },
    tableRows: matchupRows(standings?.stats ?? [], [
      homeTeam.code,
      awayTeam.code,
    ]),
  };
}

/**
 * Hero card for the featured match: home team | venue/result/status | away
 * team, with kick-off date and time across the top and a head-to-head
 * comparison at the bottom.
 */
function MatchHero({
  match,
  isToday,
  comparison,
  league,
  season,
}: {
  match: MatchInfo;
  isToday: boolean;
  comparison?: MatchComparison;
  league: League;
  season: string;
}) {
  const { homeTeamInfo, awayTeamInfo, state } = match;
  const started = state !== 'not-started';
  const suffix = match.penalties
    ? 'e. str.'
    : match.extraTime
      ? 'e. förl.'
      : null;

  return (
    <section
      aria-label={
        isToday ? 'Dagens match' : started ? 'Senaste mötet' : 'Nästa match'
      }
      className="rounded-xl border border-line bg-surface px-4 py-6 sm:px-6"
    >
      <p className="display mb-5 text-center text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
        {formatLongDateFromString(match.startDateTime)}
        {started && ` kl. ${formatTimeFromString(match.startDateTime)}`}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <HeroTeam
          team={homeTeamInfo.teamInfo}
          league={league}
          season={season}
        />

        <div className="flex flex-col items-center gap-1.5 px-2 pt-3">
          {started ? (
            <span className="num display text-3xl font-bold text-ink">
              {homeTeamInfo.score}–{awayTeamInfo.score}
            </span>
          ) : (
            <span className="num display text-3xl font-bold text-ink">
              {formatTimeFromString(match.startDateTime)}
            </span>
          )}
          {suffix && (
            <span className="text-[11px] uppercase tracking-wide text-dim">
              {suffix}
            </span>
          )}
          {state === 'live' && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-loss">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-loss"
              />
              Live
            </span>
          )}
          {state === 'finished' && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-dim">
              Slut
            </span>
          )}
          <MatchMetaRow match={match} />
          <AggregateLine match={match} />
          <span className="text-center text-sm text-dim">
            {match.venueInfo.name}
          </span>
        </div>

        <HeroTeam
          team={awayTeamInfo.teamInfo}
          league={league}
          season={season}
        />
      </div>

      {comparison && <HeroComparison comparison={comparison} />}
    </section>
  );
}

function HeroComparison({ comparison }: { comparison: MatchComparison }) {
  const { home, away } = comparison;
  const scorer = (side: TeamComparison) => playerCell(side.leaders?.topScorer);
  const assist = (side: TeamComparison) =>
    playerCell(side.leaders?.topAssists, 'A');

  const rows: {
    label: string;
    title?: string;
    home?: string;
    away?: string;
  }[] = [
    { label: 'Toppskytt', home: scorer(home), away: scorer(away) },
    { label: 'Flest assist', home: assist(home), away: assist(away) },
    {
      label: 'Hemma / borta',
      title: 'Vinster-oavgjorda-förluster (gjorda–insläppta mål)',
      home: recordCell(home.record),
      away: recordCell(away.record),
    },
  ];

  if (!rows.some((row) => row.home || row.away)) return null;

  return (
    <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2 border-t border-line-soft pt-4">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <span className="text-center text-sm text-soft">
            {row.home ?? '–'}
          </span>
          <span
            title={row.title}
            className="display text-center text-[10px] font-bold uppercase tracking-[0.08em] text-dim"
          >
            {row.label}
          </span>
          <span className="text-center text-sm text-soft">
            {row.away ?? '–'}
          </span>
        </div>
      ))}
    </div>
  );
}

/** "First Last (12)" for a leaderboard row, undefined when there is none. */
function playerCell(
  player: PlayerStats | undefined,
  metric: 'G' | 'A' = 'G',
): string | undefined {
  if (!player) return undefined;
  return `${player.info.fullName} (${player[metric]})`;
}

/** "5-2-1 (14–6)" — W-D-L plus goals for–against, undefined until played. */
function recordCell(record: SideRecord | undefined): string | undefined {
  if (!record || record.GP === 0) return undefined;
  return `${record.W}-${record.D}-${record.L} (${record.GF}–${record.GA})`;
}

/** Badge, name and country. The name links on to the team's own page. */
function HeroTeam({
  team,
  league,
  season,
}: {
  team: TeamInfo;
  league: League;
  season: string;
}) {
  return (
    <span className="flex flex-col items-center gap-2 text-center">
      <TeamBadge team={team} size="lg" />
      <Link
        href={teamPath(league, season, team.code)}
        className="text-sm font-medium text-ink transition-colors hover:text-accent sm:text-base"
      >
        <span className="hidden sm:inline">{team.long}</span>
        <span className="sm:hidden">{team.short}</span>
      </Link>
      {team.country && <CountryLabel country={team.country} />}
    </span>
  );
}

/**
 * Hero fallback when the two teams have no match left to play: same card and
 * same two-team layout as the featured match, with a note where the kick-off
 * would be. Any earlier meetings are listed below it with their results.
 */
function NoMeetingHero({
  home,
  away,
  hasPlayed,
  league,
  season,
}: {
  home: TeamInfo;
  away: TeamInfo;
  hasPlayed: boolean;
  league: League;
  season: string;
}) {
  return (
    <section
      aria-label="Inget kommande möte"
      className="rounded-xl border border-line bg-surface px-4 py-6 sm:px-6"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <HeroTeam team={home} league={league} season={season} />

        <div className="flex flex-col items-center gap-1.5 px-2 pt-3">
          <span
            aria-hidden="true"
            className="display text-3xl font-bold text-mute"
          >
            –
          </span>
          <span className="max-w-[10rem] text-balance text-center text-sm text-dim">
            {hasPlayed
              ? 'Inga fler möten den här säsongen'
              : 'Inget möte inplanerat den här säsongen'}
          </span>
        </div>

        <HeroTeam team={away} league={league} season={season} />
      </div>
    </section>
  );
}

/** Flag + country name. The name is the text alternative, so the flag is decorative. */
function CountryLabel({ country }: { country: TeamCountry }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-dim">
      <Image
        src={country.flag}
        alt=""
        aria-hidden="true"
        width={16}
        height={16}
        className="shrink-0 object-contain"
        style={{ width: 16, height: 'auto' }}
      />
      {country.name}
    </span>
  );
}
