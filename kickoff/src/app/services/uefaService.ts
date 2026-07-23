import {
  UEFA_COMPSTATS_API,
  UEFA_MATCH_API,
  UEFA_ORIGIN,
  UEFA_STANDINGS_API,
} from '@/app/config/uefa';
import type { UefaMatch } from '@/app/types/uefa/matches';
import type { UefaPlayerRankingRow } from '@/app/types/uefa/players';
import type { UefaStandingsGroup } from '@/app/types/uefa/standings';
import { generateCacheKey, getCachedData, TTL } from '@/app/utils/cache';

async function fetchJson<T>(
  url: string,
  options?: { headers?: Record<string, string>; notFound?: T },
): Promise<T> {
  const res = await fetch(url, { headers: options?.headers });
  if (res.status === 404 && options?.notFound !== undefined) {
    return options.notFound;
  }
  if (!res.ok) {
    throw new Error(`UEFA request failed (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}

const PAGE_SIZE = 40;
/**
 * Runaway backstop only — the paging loop already stops when a short page
 * comes back. It must clear the *largest* UEFA field: the Conference League
 * runs ~450–500 matches a season (its qualifying alone spans the preliminary
 * round through the play-offs), well past a Champions League season. 30 × 40 =
 * 1200 leaves generous headroom; smaller competitions break out early.
 */
const MAX_PAGES = 30;

/**
 * All matches for a season (qualifying + tournament), paged until exhausted.
 * `competitionId` selects the UEFA competition (1 = Champions League,
 * 2019 = Conference League).
 */
export async function fetchClMatches(
  competitionId: string,
  seasonYear: string,
): Promise<UefaMatch[]> {
  return getCachedData(
    generateCacheKey('uefa-matches', {
      comp: competitionId,
      season: seasonYear,
    }),
    async () => {
      const all: UefaMatch[] = [];
      for (let page = 0; page < MAX_PAGES; page++) {
        const batch = await fetchJson<UefaMatch[]>(
          `${UEFA_MATCH_API}/matches?competitionId=${competitionId}&seasonYear=${seasonYear}&phase=ALL&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}&order=ASC`,
        );
        all.push(...batch);
        if (batch.length < PAGE_SIZE) break;
      }
      return all;
    },
    TTL.matches,
  );
}

export async function fetchClStandings(
  competitionId: string,
  seasonYear: string,
): Promise<UefaStandingsGroup[]> {
  return getCachedData(
    generateCacheKey('uefa-standings', {
      comp: competitionId,
      season: seasonYear,
    }),
    () =>
      fetchJson<UefaStandingsGroup[]>(
        `${UEFA_STANDINGS_API}/standings?competitionId=${competitionId}&seasonYear=${seasonYear}&phase=TOURNAMENT`,
        // Before the league-phase draw the standings resource doesn't exist
        // yet (404) — treat that as "no table published".
        { notFound: [] },
      ),
    TTL.standings,
  );
}

/**
 * Ranked leaderboard for a single stats metric (goals, assists, …). The
 * compstats host only answers requests with a uefa.com Origin header.
 */
export async function fetchClPlayerRanking(
  competitionId: string,
  seasonYear: string,
  stat: string,
  limit = 20,
): Promise<UefaPlayerRankingRow[]> {
  return getCachedData(
    generateCacheKey('uefa-players', {
      comp: competitionId,
      season: seasonYear,
      stat,
      limit: String(limit),
    }),
    () =>
      fetchJson<UefaPlayerRankingRow[]>(
        `${UEFA_COMPSTATS_API}/player-ranking?competitionId=${competitionId}&seasonYear=${seasonYear}&phase=TOURNAMENT&stats=${stat}&limit=${limit}&offset=0&order=DESC&optionalFields=PLAYER,TEAM`,
        {
          headers: { Origin: UEFA_ORIGIN, Referer: `${UEFA_ORIGIN}/` },
          // Not published before the season starts.
          notFound: [],
        },
      ),
    TTL.stats,
  );
}
