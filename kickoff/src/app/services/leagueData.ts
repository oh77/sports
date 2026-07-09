import { resolveSeason } from '@/app/config/leagues';
import { PL_PLAYER_SORT } from '@/app/config/pulselive';
import { UCL_PLAYER_STATS } from '@/app/config/uefa';
import type { KeeperStatsData } from '@/app/types/domain/keeper-stats';
import type { League } from '@/app/types/domain/league';
import type { MatchesData } from '@/app/types/domain/match';
import type { PlayerStatsData } from '@/app/types/domain/player-stats';
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
  allsvenskanMatchesToDomain,
  allsvenskanPlayersToDomain,
  allsvenskanStandingsToDomain,
  allsvenskanTeamToDomain,
} from '@/app/utils/translators/sportomediaToDomain';
import {
  clCardsToPlayers,
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
  fetchAllsvenskanMatches,
  fetchAllsvenskanPlayers,
  fetchAllsvenskanStandings,
  fetchAllsvenskanTeams,
} from './sportomediaService';
import {
  fetchClMatches,
  fetchClPlayerRanking,
  fetchClStandings,
} from './uefaService';

/**
 * Per-league data access in the application contract. Pages and API routes
 * only talk to this module; it dispatches to the league's provider service +
 * translator (pulselive for PL, sportomedia for Allsvenskan, UEFA for CL).
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

/** Allsvenskan season keys are the start year ("2026"). */
function allsvenskanSeasonYear(seasonKey?: string | null): number {
  const season = resolveSeason('allsvenskan', seasonKey);
  return Number(season.externalId ?? season.key);
}

/** UEFA's seasonYear is the season's end year ("25-26" -> "2026"). */
function clSeasonYear(seasonKey?: string | null): string {
  const season = resolveSeason('cl', seasonKey);
  return season.externalId ?? season.key;
}

export async function getMatches(
  league: League,
  seasonKey?: string,
): Promise<MatchesData> {
  if (league === 'pl') {
    return plMatchesToDomain(await fetchPlMatchesWindow(plSeasonId(seasonKey)));
  }
  if (league === 'allsvenskan') {
    const year = allsvenskanSeasonYear(seasonKey);
    const [matches, teams] = await Promise.all([
      fetchAllsvenskanMatches(year),
      fetchAllsvenskanTeams(year),
    ]);
    return allsvenskanMatchesToDomain(matches, teams);
  }
  return clMatchesToDomain(await fetchClMatches(clSeasonYear(seasonKey)));
}

export async function getStandings(
  league: League,
  seasonKey?: string,
): Promise<StandingsData> {
  if (league === 'pl') {
    return plStandingsToDomain(await fetchPlStandings(plSeasonId(seasonKey)));
  }
  if (league === 'allsvenskan') {
    const year = allsvenskanSeasonYear(seasonKey);
    const [standings, teams, matches] = await Promise.all([
      fetchAllsvenskanStandings(year),
      fetchAllsvenskanTeams(year),
      fetchAllsvenskanMatches(year),
    ]);
    // The provider's form field is unreliable; derive it from the schedule.
    return allsvenskanStandingsToDomain(
      standings,
      teams,
      allsvenskanMatchesToDomain(matches, teams),
    );
  }
  const year = clSeasonYear(seasonKey);
  const [groups, matches] = await Promise.all([
    fetchClStandings(year),
    fetchClMatches(year),
  ]);
  // UEFA supplies no form; derive it from the schedule.
  return clStandingsToDomain(groups, clMatchesToDomain(matches));
}

export async function getPlayerStats(
  league: League,
  seasonKey: string | undefined,
  sort: PlayerStatsSort,
): Promise<PlayerStatsData> {
  if (league === 'pl') {
    const entries = await fetchPlPlayerLeaderboard(
      plSeasonId(seasonKey),
      PL_PLAYER_SORT[sort],
    );
    return plPlayersToDomain(entries, HIGHLIGHT[sort]);
  }
  if (league === 'allsvenskan') {
    const players = await fetchAllsvenskanPlayers(
      allsvenskanSeasonYear(seasonKey),
    );
    return sortPlayerStats(allsvenskanPlayersToDomain(players), sort);
  }
  // CL: the ranking endpoint serves one metric per request.
  const year = clSeasonYear(seasonKey);
  if (sort === 'cards') {
    const [yellow, red] = await Promise.all([
      fetchClPlayerRanking(year, UCL_PLAYER_STATS.yellowCards),
      fetchClPlayerRanking(year, UCL_PLAYER_STATS.redCards),
    ]);
    return clCardsToPlayers(yellow, red, year);
  }
  const metric = sort === 'goals' ? 'G' : 'A';
  const rows = await fetchClPlayerRanking(year, UCL_PLAYER_STATS[sort]);
  return clRankingToPlayers(rows, metric, year);
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
  if (league === 'allsvenskan') {
    const teams = await fetchAllsvenskanTeams(allsvenskanSeasonYear(seasonKey));
    return teams.map(allsvenskanTeamToDomain);
  }
  // CL: the teams host is origin-locked, so derive teams from the standings
  // (falling back to the schedule before standings exist).
  const year = clSeasonYear(seasonKey);
  const groups = await fetchClStandings(year);
  const fromStandings = groups.flatMap((g) =>
    g.items.map((item) => clTeamToDomain(item.team)),
  );
  if (fromStandings.length > 0) return fromStandings;

  const byCode = new Map<string, TeamInfo>();
  for (const match of clMatchesToDomain(await fetchClMatches(year)).matches) {
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
