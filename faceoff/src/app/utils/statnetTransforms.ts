import type { GoalieStatsData } from '../types/domain/goalie-stats';
import type { PlayerStatsData } from '../types/domain/player-stats';
import type { DataColumn, StandingsData } from '../types/domain/standings';
import type {
  StatnetGameTeamInfo,
  StatnetLeagueResponse,
} from '../types/statnet/game';
import type { StatnetGoalieStatsData } from '../types/statnet/goalie-stats';
import type { StatnetPlayerStatsData } from '../types/statnet/player-stats';
import type { StatnetTeamStats } from '../types/statnet/standings';
import {
  translateStatnetGoalieStatsToDomain,
  translateStatnetPlayerStatsToDomain,
  translateStatnetTeamStatsToDomain,
} from './translators/statnetToDomain';

/** Extract the unique set of teams from a game schedule response. */
export function extractStatnetTeams(
  data: StatnetLeagueResponse,
): StatnetGameTeamInfo[] {
  const games = data.gameInfo || [];
  if (games.length === 0) {
    throw new Error('No games data available');
  }

  const teamMap = new Map<string, StatnetGameTeamInfo>();
  games.forEach((game) => {
    const homeCode = game.homeTeamInfo.names?.code || game.homeTeamInfo.code;
    const awayCode = game.awayTeamInfo.names?.code || game.awayTeamInfo.code;

    if (!teamMap.has(homeCode)) teamMap.set(homeCode, game.homeTeamInfo);
    if (!teamMap.has(awayCode)) teamMap.set(awayCode, game.awayTeamInfo);
  });

  return Array.from(teamMap.values());
}

type StatnetStandingsResponse = {
  dataColumns: DataColumn[];
  stats: StatnetTeamStats[];
};

/** Translate a raw standings response to the domain model. */
export function transformStandings(raw: unknown): StandingsData {
  // Stats endpoints return [] before a season has any played games.
  const statnetData = (raw as StatnetStandingsResponse[])[0];
  if (!statnetData) {
    return { dataColumns: [], stats: [] };
  }
  return {
    dataColumns: statnetData.dataColumns,
    stats: statnetData.stats.map(translateStatnetTeamStatsToDomain),
  };
}

const EMPTY_SORT_KEY = { name: '', order: '' };

/** Translate a raw goalie-stats response to the domain model, optionally filtered by team. */
export function transformGoalies(
  raw: unknown,
  teamCode?: string | null,
): GoalieStatsData {
  const statnetData: StatnetGoalieStatsData | undefined = Array.isArray(raw)
    ? raw[0]
    : (raw as StatnetGoalieStatsData);
  if (!statnetData) {
    return { dataColumns: [], defaultSortKey: EMPTY_SORT_KEY, stats: [] };
  }

  const stats = statnetData.stats.map(translateStatnetGoalieStatsToDomain);
  return {
    dataColumns: statnetData.dataColumns,
    defaultSortKey: statnetData.defaultSortKey,
    stats: teamCode
      ? stats.filter((goalie) => goalie.info.team.code === teamCode)
      : stats,
  };
}

/** Translate a raw player-stats response to the domain model, optionally filtered by team. */
export function transformPlayers(
  raw: unknown,
  teamCode?: string | null,
): PlayerStatsData {
  const statnetData = (raw as StatnetPlayerStatsData[])[0];
  if (!statnetData) {
    return { dataColumns: [], defaultSortKey: EMPTY_SORT_KEY, stats: [] };
  }

  const stats = statnetData.stats.map(translateStatnetPlayerStatsToDomain);
  return {
    dataColumns: statnetData.dataColumns,
    defaultSortKey: statnetData.defaultSortKey,
    stats: teamCode
      ? stats.filter((player) => player.info.team.code === teamCode)
      : stats,
  };
}
