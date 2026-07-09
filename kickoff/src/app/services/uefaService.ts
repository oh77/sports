import {
  UCL_COMPETITION_ID,
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
/** Safety cap: 10 pages × 40 covers qualifying + a full UCL tournament. */
const MAX_PAGES = 10;

/** All matches for a season (qualifying + tournament), paged until exhausted. */
export async function fetchClMatches(seasonYear: string): Promise<UefaMatch[]> {
  return getCachedData(
    generateCacheKey('cl-matches', { season: seasonYear }),
    async () => {
      const all: UefaMatch[] = [];
      for (let page = 0; page < MAX_PAGES; page++) {
        const batch = await fetchJson<UefaMatch[]>(
          `${UEFA_MATCH_API}/matches?competitionId=${UCL_COMPETITION_ID}&seasonYear=${seasonYear}&phase=ALL&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}&order=ASC`,
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
  seasonYear: string,
): Promise<UefaStandingsGroup[]> {
  return getCachedData(
    generateCacheKey('cl-standings', { season: seasonYear }),
    () =>
      fetchJson<UefaStandingsGroup[]>(
        `${UEFA_STANDINGS_API}/standings?competitionId=${UCL_COMPETITION_ID}&seasonYear=${seasonYear}&phase=TOURNAMENT`,
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
  seasonYear: string,
  stat: string,
): Promise<UefaPlayerRankingRow[]> {
  return getCachedData(
    generateCacheKey('cl-players', { season: seasonYear, stat }),
    () =>
      fetchJson<UefaPlayerRankingRow[]>(
        `${UEFA_COMPSTATS_API}/player-ranking?competitionId=${UCL_COMPETITION_ID}&seasonYear=${seasonYear}&phase=TOURNAMENT&stats=${stat}&limit=20&offset=0&order=DESC&optionalFields=PLAYER,TEAM`,
        {
          headers: { Origin: UEFA_ORIGIN, Referer: `${UEFA_ORIGIN}/` },
          // Not published before the season starts.
          notFound: [],
        },
      ),
    TTL.stats,
  );
}
