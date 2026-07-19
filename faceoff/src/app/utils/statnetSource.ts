import {
  type GameType,
  resolveSeason,
  type SeasonConfig,
  STATNET_LEAGUES,
  type StatnetLeague,
} from '../config/statnet';
import { generateCacheKey, getCachedData } from './cache';

/** Statnet resources exposed through the per-league API routes. */
export type StatnetResource =
  | 'games'
  | 'teams'
  | 'standings'
  | 'goalies'
  | 'players';

type FetchOptions = {
  /** Season key (e.g. "25-26"); defaults to the current season. */
  season?: string;
  /** Result count for the players resource. */
  count?: number;
  /** Schedule phase for the games/teams resources; defaults to regular season. */
  gameType?: GameType;
};

/** Read the `season` query param from a request, if present. */
export function getSeasonParam(request: Request): string | undefined {
  return new URL(request.url).searchParams.get('season') ?? undefined;
}

/** Read the `gameType` query param from a request, if a valid value. */
export function getGameTypeParam(request: Request): GameType | undefined {
  const value = new URL(request.url).searchParams.get('gameType');
  return value === 'regular' || value === 'playoffs' || value === 'qualifying'
    ? value
    : undefined;
}

/** Build the upstream Statnet URL for a league/resource/season. */
export function buildStatnetUrl(
  league: StatnetLeague,
  resource: StatnetResource,
  season: SeasonConfig,
  { count, gameType = 'regular' }: { count?: number; gameType?: GameType } = {},
): string {
  const { host, seriesUuid, provider, gameTypes } = STATNET_LEAGUES[league];
  const base = `https://${host}/api`;
  const ssgtUuid = season.ssgtUuid[league];

  switch (resource) {
    case 'games':
    case 'teams':
      return `${base}/sports-v2/game-schedule?seasonUuid=${season.seasonUuid}&seriesUuid=${seriesUuid}&gameTypeUuid=${gameTypes[gameType]}&gamePlace=all&played=all`;
    case 'standings':
      return `${base}/statistics-v2/stats-info/standings_standings?count=25&ssgtUuid=${ssgtUuid}&provider=${provider}`;
    case 'goalies':
      return `${base}/statistics-v2/stats-info/goalkeepers_summary?count=25&ssgtUuid=${ssgtUuid}&provider=${provider}`;
    case 'players':
      return `${base}/statistics-v2/stats-info/players_point?count=${count ?? 50}&ssgtUuid=${ssgtUuid}&provider=${provider}&state=active&moduleType=summary`;
  }
}

/** Browser-like headers required by the Statnet endpoints, scoped to the league host. */
function statnetHeaders(league: StatnetLeague): HeadersInit {
  const origin = `https://${STATNET_LEAGUES[league].host}`;
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: `${origin}/`,
    Origin: origin,
  };
}

/**
 * Fetch a raw Statnet resource, cached per league/resource/season (and count
 * for players). Returns the upstream JSON unchanged; callers translate and
 * filter as needed.
 */
export async function fetchStatnet<T = unknown>(
  league: StatnetLeague,
  resource: StatnetResource,
  opts: FetchOptions = {},
): Promise<T> {
  const season = resolveSeason(opts.season);
  const url = buildStatnetUrl(league, resource, season, {
    count: opts.count,
    gameType: opts.gameType,
  });

  const params: Record<string, string> = { season: season.key };
  if (opts.count != null) params.count = String(opts.count);
  if (opts.gameType) params.gameType = opts.gameType;
  const cacheKey = generateCacheKey(`${league}-${resource}`, params);

  return getCachedData<T>(cacheKey, async () => {
    const response = await fetch(url, { headers: statnetHeaders(league) });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  });
}
