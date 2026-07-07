import {
  PL_COMPETITION_ID,
  PL_MATCHWEEKS,
  PULSELIVE_API,
} from '@/app/config/pulselive';
import type {
  PulseliveMatch,
  PulseliveMatchesResponse,
} from '@/app/types/pulselive/matches';
import type {
  PulselivePlayerEntry,
  PulselivePlayersResponse,
} from '@/app/types/pulselive/players';
import type { PulseliveStandingsResponse } from '@/app/types/pulselive/standings';
import type {
  PulseliveTeam,
  PulseliveTeamsResponse,
} from '@/app/types/pulselive/teams';
import { generateCacheKey, getCachedData, TTL } from '@/app/utils/cache';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Pulselive request failed (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlStandings(
  seasonId: string,
): Promise<PulseliveStandingsResponse> {
  return getCachedData(
    generateCacheKey('pl-standings', { season: seasonId }),
    () =>
      fetchJson(
        `${PULSELIVE_API}/v5/competitions/${PL_COMPETITION_ID}/seasons/${seasonId}/standings?live=false`,
      ),
    TTL.standings,
  );
}

export async function fetchPlMatchweek(
  seasonId: string,
  matchweek: number,
): Promise<PulseliveMatch[]> {
  const response = await getCachedData<PulseliveMatchesResponse>(
    generateCacheKey('pl-matches', {
      season: seasonId,
      week: String(matchweek),
    }),
    () =>
      fetchJson(
        `${PULSELIVE_API}/v2/matches?competition=${PL_COMPETITION_ID}&season=${seasonId}&matchweek=${matchweek}&_limit=20`,
      ),
    TTL.matches,
  );
  return response.data;
}

/**
 * Matches around the season's current matchweek (previous, current, next).
 * The current matchweek comes from the standings response.
 */
export async function fetchPlMatchesWindow(
  seasonId: string,
): Promise<PulseliveMatch[]> {
  const standings = await fetchPlStandings(seasonId);
  const current = standings.matchweek;
  const weeks = [current - 1, current, current + 1].filter(
    (w) => w >= 1 && w <= PL_MATCHWEEKS,
  );
  const results = await Promise.all(
    weeks.map((w) => fetchPlMatchweek(seasonId, w)),
  );
  return results.flat();
}

export async function fetchPlTeams(seasonId: string): Promise<PulseliveTeam[]> {
  const response = await getCachedData<PulseliveTeamsResponse>(
    generateCacheKey('pl-teams', { season: seasonId }),
    () =>
      fetchJson(
        `${PULSELIVE_API}/v1/competitions/${PL_COMPETITION_ID}/seasons/${seasonId}/teams?_limit=20`,
      ),
  );
  return response.data;
}

export async function fetchPlPlayerLeaderboard(
  seasonId: string,
  sortKey: string,
): Promise<PulselivePlayerEntry[]> {
  const sort = encodeURIComponent(`${sortKey}:desc`);
  const response = await getCachedData<PulselivePlayersResponse>(
    generateCacheKey('pl-players', { season: seasonId, sort: sortKey }),
    () =>
      fetchJson(
        `${PULSELIVE_API}/v3/competitions/${PL_COMPETITION_ID}/seasons/${seasonId}/players/stats/leaderboard?_sort=${sort}&country=&_limit=20`,
      ),
    TTL.stats,
  );
  return response.data;
}
