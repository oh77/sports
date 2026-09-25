import { hasStandingsAndStats, resolveSeason } from '@/app/config/leagues';
import { PL_PLAYER_SORT } from '@/app/config/pulselive';
import {
  ALLSVENSKAN_LEAGUE_NAME,
  SUPERETTAN_LEAGUE_NAME,
} from '@/app/config/sportomedia';
import {
  UCL_COMPETITION_ID,
  UECL_COMPETITION_ID,
  UEFA_RANKING_STATS,
  UEL_COMPETITION_ID,
  UNL_COMPETITION_ID,
} from '@/app/config/uefa';
import type { KeeperStatsData } from '@/app/types/domain/keeper-stats';
import type { League } from '@/app/types/domain/league';
import type { MatchesData } from '@/app/types/domain/match';
import type {
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import { playerColumns } from '@/app/utils/footballColumns';
import {
  plMatchesToDomain,
  plPlayersToDomain,
  plStandingsToDomain,
  plTeamToDomain,
} from '@/app/utils/translators/pulseliveToDomain';
import {
  sportomediaMatchesToDomain,
  sportomediaPlayersToDomain,
  sportomediaStandingsToDomain,
  sportomediaTeamToDomain,
} from '@/app/utils/translators/sportomediaToDomain';
import {
  clMatchesToDomain,
  clRankingToPlayers,
  clStandingsToDomain,
  clTeamToDomain,
} from '@/app/utils/translators/uefaToDomain';
import {
  fetchPlMatchesWindow,
  fetchPlPlayerLeaderboard,
  fetchPlStandings,
  fetchPlTeams,
} from './pulseliveService';
import {
  fetchSportomediaMatches,
  fetchSportomediaPlayers,
  fetchSportomediaStandings,
  fetchSportomediaTeams,
} from './sportomediaService';
import {
  fetchClMatches,
  fetchClPlayerRanking,
  fetchClStandings,
} from './uefaService';

/**
 * Per-league data access in the application contract. Pages and API routes
 * only talk to this module; it dispatches to the league's provider service +
 * translator (pulselive for PL, sportomedia for Allsvenskan/Superettan, UEFA
 * for the European competitions).
 */

export type PlayerStatsSort = 'goals' | 'assists' | 'cards';

const HIGHLIGHT: Record<PlayerStatsSort, 'G' | 'A' | 'YC'> = {
  goals: 'G',
  assists: 'A',
  cards: 'YC',
};

/** Season id in the pulselive API for a URL season key. */
function plSeasonId(seasonKey?: string | null): string {
  const season = resolveSeason('pl', seasonKey);
  return season.externalId ?? season.key;
}

/** True for the Swedish leagues, which share the sportomedia provider. */
function isSportomedia(league: League): boolean {
  return league === 'allsvenskan' || league === 'superettan';
}

/** The provider's `configLeagueName` for a Swedish league. */
function sportomediaLeagueName(league: League): string {
  return league === 'superettan'
    ? SUPERETTAN_LEAGUE_NAME
    : ALLSVENSKAN_LEAGUE_NAME;
}

/** Swedish season keys are the start year ("2026"). */
function sportomediaSeasonYear(
  league: League,
  seasonKey?: string | null,
): number {
  const season = resolveSeason(league, seasonKey);
  return Number(season.externalId ?? season.key);
}

/** UEFA's seasonYear is the season's end year ("25-26" -> "2026"). */
function uefaSeasonYear(league: League, seasonKey?: string | null): string {
  const season = resolveSeason(league, seasonKey);
  return season.externalId ?? season.key;
}

/**
 * UEFA competition id for a UEFA league (Champions/Europa/Conference/Nations
 * League).
 */
function uefaCompetitionId(league: League): string {
  if (league === 'nl') return UNL_COMPETITION_ID;
  if (league === 'col') return UECL_COMPETITION_ID;
  if (league === 'el') return UEL_COMPETITION_ID;
  return UCL_COMPETITION_ID;
}

export async function getMatches(
  league: League,
  seasonKey?: string,
): Promise<MatchesData> {
  if (league === 'pl') {
    return plMatchesToDomain(await fetchPlMatchesWindow(plSeasonId(seasonKey)));
  }
  if (isSportomedia(league)) {
    const name = sportomediaLeagueName(league);
    const year = sportomediaSeasonYear(league, seasonKey);
    const [matches, teams] = await Promise.all([
      fetchSportomediaMatches(name, year),
      fetchSportomediaTeams(name, year),
    ]);
    return sportomediaMatchesToDomain(matches, teams);
  }
  return clMatchesToDomain(
    await fetchClMatches(
      uefaCompetitionId(league),
      uefaSeasonYear(league, seasonKey),
    ),
  );
}

export async function getStandings(
  league: League,
  seasonKey?: string,
): Promise<StandingsData> {
  if (league === 'pl') {
    return plStandingsToDomain(await fetchPlStandings(plSeasonId(seasonKey)));
  }
  if (isSportomedia(league)) {
    const name = sportomediaLeagueName(league);
    const year = sportomediaSeasonYear(league, seasonKey);
    const [standings, teams, matches] = await Promise.all([
      fetchSportomediaStandings(name, year),
      fetchSportomediaTeams(name, year),
      fetchSportomediaMatches(name, year),
    ]);
    // The provider's form field is unreliable; derive it from the schedule.
    return sportomediaStandingsToDomain(
      league,
      standings,
      teams,
      sportomediaMatchesToDomain(matches, teams),
    );
  }
  const competitionId = uefaCompetitionId(league);
  const year = uefaSeasonYear(league, seasonKey);
  const [groups, matches] = await Promise.all([
    fetchClStandings(competitionId, year),
    fetchClMatches(competitionId, year),
  ]);
  // UEFA supplies no form; derive it from the schedule. Zones follow the
  // club competitions' format, so matches-only leagues (the Nations League,
  // with promotion/relegation between leagues) get none.
  return clStandingsToDomain(groups, clMatchesToDomain(matches), {
    zones: hasStandingsAndStats(league),
  });
}

export async function getPlayerStats(
  league: League,
  seasonKey: string | undefined,
  sort: PlayerStatsSort,
  limit = 50,
): Promise<PlayerStatsData> {
  if (league === 'pl') {
    const entries = await fetchPlPlayerLeaderboard(
      plSeasonId(seasonKey),
      PL_PLAYER_SORT[sort],
      limit,
    );
    return plPlayersToDomain(entries, HIGHLIGHT[sort]);
  }
  if (isSportomedia(league)) {
    const players = await fetchSportomediaPlayers(
      sportomediaLeagueName(league),
      sportomediaSeasonYear(league, seasonKey),
    );
    return sortPlayerStats(sportomediaPlayersToDomain(players), sort);
  }
  // UEFA competitions: one ranking request carries goals, assists and
  // appearances (or cards), ranked by the view's leading metric.
  const competitionId = uefaCompetitionId(league);
  const year = uefaSeasonYear(league, seasonKey);
  const rows = await fetchClPlayerRanking(
    competitionId,
    year,
    UEFA_RANKING_STATS[sort],
    limit,
  );
  return clRankingToPlayers(rows, HIGHLIGHT[sort], competitionId, year);
}

/**
 * Deep enough leaderboard slice that every team is likely represented; the
 * Allsvenskan provider always returns all players regardless.
 */
const TEAM_LEADERS_POOL = 100;

export interface TeamLeaders {
  topScorer?: PlayerStats;
  topAssists?: PlayerStats;
}

/**
 * Leading scorer and assist maker for specific teams, taken from the
 * league-wide goals/assists leaderboards. PL/CL leaderboards are top-N
 * slices, so a team with no player in the slice gets undefined leaders.
 */
export async function getTeamLeaders(
  league: League,
  seasonKey: string | undefined,
  teams: TeamInfo[],
): Promise<Map<string, TeamLeaders>> {
  const [goals, assists] = await Promise.all([
    getPlayerStats(league, seasonKey, 'goals', TEAM_LEADERS_POOL),
    getPlayerStats(league, seasonKey, 'assists', TEAM_LEADERS_POOL),
  ]);

  const leaders = new Map<string, TeamLeaders>();
  for (const team of teams) {
    // Provider quirk: PL player rows carry no team abbreviation, so the
    // player's team code differs from the team's — the external id agrees.
    const belongsToTeam = (p: PlayerStats) =>
      p.info.team.code === team.code ||
      p.info.team.externalId === team.externalId;
    leaders.set(team.code, {
      topScorer: goals.stats.find((p) => belongsToTeam(p) && p.G > 0),
      topAssists: assists.stats.find((p) => belongsToTeam(p) && p.A > 0),
    });
  }
  return leaders;
}

// Takes no params: none of the providers exposes keeper stats yet, so the
// Målvakter view is hidden everywhere — re-add league/season params with the
// first real keeper integration.
export async function getKeeperStats(): Promise<KeeperStatsData | null> {
  return null;
}

export async function getTeams(
  league: League,
  seasonKey?: string,
): Promise<TeamInfo[]> {
  if (league === 'pl') {
    return (await fetchPlTeams(plSeasonId(seasonKey))).map(plTeamToDomain);
  }
  if (isSportomedia(league)) {
    const teams = await fetchSportomediaTeams(
      sportomediaLeagueName(league),
      sportomediaSeasonYear(league, seasonKey),
    );
    return teams.map(sportomediaTeamToDomain);
  }
  // UEFA leagues: the teams host is origin-locked, so derive teams from the
  // standings (falling back to the schedule before standings exist, and for
  // matches-only leagues).
  const competitionId = uefaCompetitionId(league);
  const year = uefaSeasonYear(league, seasonKey);
  if (hasStandingsAndStats(league)) {
    const groups = await fetchClStandings(competitionId, year);
    const fromStandings = groups.flatMap((g) =>
      g.items.map((item) => clTeamToDomain(item.team)),
    );
    if (fromStandings.length > 0) return fromStandings;
  }

  const byCode = new Map<string, TeamInfo>();
  for (const match of clMatchesToDomain(
    await fetchClMatches(competitionId, year),
  ).matches) {
    const home = match.homeTeamInfo.teamInfo;
    const away = match.awayTeamInfo.teamInfo;
    byCode.set(home.code, home);
    byCode.set(away.code, away);
  }
  return Array.from(byCode.values());
}

/** Local sorting for leagues whose provider can't sort server-side. */
function sortPlayerStats(
  data: PlayerStatsData,
  sort: PlayerStatsSort,
): PlayerStatsData {
  const highlight = HIGHLIGHT[sort];
  const stats = [...data.stats]
    .sort((a, b) => {
      if (sort === 'goals') return b.G - a.G || b.TP - a.TP;
      if (sort === 'assists') return b.A - a.A || b.TP - a.TP;
      return b.YC + b.RC * 2 - (a.YC + a.RC * 2);
    })
    .map((row, i) => ({ ...row, Rank: i + 1 }));

  return {
    dataColumns: playerColumns(highlight),
    defaultSortKey: { name: highlight, order: 'desc' },
    stats,
  };
}
