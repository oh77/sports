import Image from 'next/image';
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
import type { SideRecord, TeamStanding } from '@/app/types/domain/standings';
import type { TeamCountry, TeamInfo } from '@/app/types/domain/team';
import {
  dateKeyFromString,
  formatLongDateFromString,
  formatTimeFromString,
  todayDateKey,
} from '@/app/utils/dateUtils';
import { outcomeFor } from '@/app/utils/form';
import { teamCodeMatches } from '@/app/utils/leaguePaths';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ league: string; season: string; teamCode: string }>;
}) {
  const { league, season, teamCode } = await params;
  if (!isLeague(league)) notFound();

  const [teams, { matches }] = await Promise.all([
    getTeams(league, season),
    getMatches(league, season),
  ]);

  const team = teams.find((t) => teamCodeMatches(t.code, teamCode));
  if (!team) notFound();

  const teamMatches = matches.filter(
    (m) =>
      m.homeTeamInfo.teamInfo.code === team.code ||
      m.awayTeamInfo.teamInfo.code === team.code,
  );

  const chronological = [...teamMatches].sort((a, b) =>
    a.startDateTime.localeCompare(b.startDateTime),
  );

  // Today's match stays featured all day, whatever its state; otherwise the
  // next scheduled match takes the spot.
  const todaysMatch = chronological.find(
    (m) => dateKeyFromString(m.startDateTime) === todayDateKey(),
  );
  const featured =
    todaysMatch ?? chronological.find((m) => m.state === 'not-started');
  const upcoming = chronological
    .filter((m) => m.state === 'not-started' && m !== featured)
    .slice(0, 5);
  const previous = teamMatches
    .filter((m) => m.state === 'finished')
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
    .slice(0, 5);
  const form = previous.map((m) => outcomeFor(team.code, m)).reverse();

  const matchup = featured
    ? await matchupData(league, season, featured)
    : undefined;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <TeamBadge team={team} />
        <h1 className="display text-2xl font-bold uppercase tracking-[0.08em] text-ink">
          {team.full}
        </h1>
        {form.length > 0 && <FormMarkers form={form} />}
      </div>

      <div className="flex flex-col gap-8">
        {featured ? (
          <MatchHero
            match={featured}
            isToday={!!todaysMatch}
            comparison={matchup?.comparison}
          />
        ) : (
          <TeamHero team={team} />
        )}

        {featured && matchup && matchup.tableRows.length > 0 && (
          <section aria-label="Läget i tabellen">
            <MatchupTable
              rows={matchup.tableRows}
              highlight={[
                featured.homeTeamInfo.teamInfo.code,
                featured.awayTeamInfo.teamInfo.code,
              ]}
              league={league}
              season={season}
              caption="Tabellutdrag kring lagen i matchen"
            />
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Senaste matcherna
            </h2>
            <MatchList
              matches={previous}
              perspective={team.code}
              league={league}
              season={season}
            />
          </section>
          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Kommande matcher
            </h2>
            <MatchList
              matches={upcoming}
              perspective={team.code}
              league={league}
              season={season}
            />
          </section>
        </div>
      </div>
    </main>
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
 * Standings-derived context for the featured match: the head-to-head
 * comparison (top scorer/assist, home/away records) and a table excerpt
 * around the two teams. Fetch failures degrade to empty data — the hero must
 * render regardless.
 */
async function matchupData(
  league: League,
  season: string,
  match: MatchInfo,
): Promise<{ comparison: MatchComparison; tableRows: TeamStanding[] }> {
  const homeTeam = match.homeTeamInfo.teamInfo;
  const awayTeam = match.awayTeamInfo.teamInfo;

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
}: {
  match: MatchInfo;
  isToday: boolean;
  comparison?: MatchComparison;
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
      aria-label={isToday ? 'Dagens match' : 'Nästa match'}
      className="rounded-xl border border-line bg-surface px-4 py-6 sm:px-6"
    >
      <p className="display mb-5 text-center text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
        {formatLongDateFromString(match.startDateTime)}
        {started && ` kl. ${formatTimeFromString(match.startDateTime)}`}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <HeroTeam team={homeTeamInfo.teamInfo} />

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

        <HeroTeam team={awayTeamInfo.teamInfo} />
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

function HeroTeam({ team }: { team: TeamInfo }) {
  return (
    <span className="flex flex-col items-center gap-2 text-center">
      <TeamBadge team={team} size="lg" />
      <span className="text-sm font-medium text-ink sm:text-base">
        <span className="hidden sm:inline">{team.long}</span>
        <span className="sm:hidden">{team.short}</span>
      </span>
      {team.country && <CountryLabel country={team.country} />}
    </span>
  );
}

/**
 * Hero fallback when the team has no upcoming or ongoing match to feature:
 * logo, name and country centered in the same card.
 */
function TeamHero({ team }: { team: TeamInfo }) {
  return (
    <section
      aria-label="Lag"
      className="flex flex-col items-center gap-4 rounded-xl border border-line bg-surface px-4 py-16 text-center sm:px-6 sm:py-20"
    >
      <TeamBadge team={team} size="lg" />
      <span className="display text-xl font-bold uppercase tracking-[0.08em] text-ink">
        {team.full}
      </span>
      {team.country && <CountryLabel country={team.country} />}
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
