import { resolveSeason } from '@/app/config/leagues';
import { PL_PLAYER_SORT } from '@/app/config/pulselive';
import type { KeeperStatsData } from '@/app/types/domain/keeper-stats';
import type { League } from '@/app/types/domain/league';
import type { MatchesData } from '@/app/types/domain/match';
import type { PlayerStatsData } from '@/app/types/domain/player-stats';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import {
  fixtureKeeperStats,
  fixtureMatches,
  fixturePlayerStats,
  fixtureStandings,
  fixtureTeams,
} from '@/app/utils/fixtures';
import { playerColumns } from '@/app/utils/footballColumns';
import {
  plMatchesToDomain,
  plPlayersToDomain,
  plStandingsToDomain,
  plTeamToDomain,
} from '@/app/utils/translators/pulseliveToDomain';
import {
  fetchPlMatchesWindow,
  fetchPlPlayerLeaderboard,
  fetchPlStandings,
  fetchPlTeams,
} from './pulseliveService';

/**
 * Per-league data access in the application contract. Pages and API routes
 * only talk to this module; it dispatches to the league's provider service +
 * translator. Leagues without an integration yet fall back to fixture data.
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

export async function getMatches(
  league: League,
  seasonKey?: string,
): Promise<MatchesData> {
  if (league === 'pl') {
    return plMatchesToDomain(await fetchPlMatchesWindow(plSeasonId(seasonKey)));
  }
  return fixtureMatches(league);
}

export async function getStandings(
  league: League,
  seasonKey?: string,
): Promise<StandingsData> {
  if (league === 'pl') {
    return plStandingsToDomain(await fetchPlStandings(plSeasonId(seasonKey)));
  }
  return fixtureStandings(league);
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
  return sortPlayerStats(fixturePlayerStats(league), sort);
}

// Takes no season yet: fixtures are season-less and PL has no keeper endpoint
// documented — re-add the param with the first real keeper integration.
export async function getKeeperStats(
  league: League,
): Promise<KeeperStatsData | null> {
  if (league === 'pl') return null;
  return fixtureKeeperStats(league);
}

export async function getTeams(
  league: League,
  seasonKey?: string,
): Promise<TeamInfo[]> {
  if (league === 'pl') {
    return (await fetchPlTeams(plSeasonId(seasonKey))).map(plTeamToDomain);
  }
  return fixtureTeams(league);
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
