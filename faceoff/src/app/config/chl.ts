/**
 * CHL season configuration. Every CHL resource (schedule, teams, standings,
 * player/goalie stats) is fetched from a URL shaped like
 *   https://www.chl.hockey/api/s3?q=<resource>-<competitionId>-<seasonId>.json
 * (standings uses the `/api/s3/live` path). The competition id is constant;
 * only the season id changes between seasons.
 */

export const CHL_COMPETITION_ID = '21ec9dad81abe2e0240460d0';

export type ChlSeasonConfig = {
  /** URL-facing season key, e.g. "26-27" (shared with the statnet leagues). */
  key: string;
  /** Marks the season used when no explicit season is requested. */
  current?: boolean;
  seasonId: string;
};

/** Known CHL seasons. Add new seasons here; mark exactly one as `current`. */
export const CHL_SEASONS: ChlSeasonConfig[] = [
  { key: '26-27', current: true, seasonId: 'fc954f6d33272fdf4a8b95bb' },
  { key: '25-26', seasonId: '3c5f99fa605394cc65733fc9' },
];

export const CURRENT_CHL_SEASON: ChlSeasonConfig =
  CHL_SEASONS.find((s) => s.current) ?? CHL_SEASONS[0];

/** Resolve a season key to its CHL config, falling back to the current season. */
export function resolveChlSeason(key?: string | null): ChlSeasonConfig {
  if (!key) return CURRENT_CHL_SEASON;
  return CHL_SEASONS.find((s) => s.key === key) ?? CURRENT_CHL_SEASON;
}

/** Build a CHL resource URL for a given season id. */
export function chlResourceUrl(
  resource: string,
  seasonId: string,
  { live = false }: { live?: boolean } = {},
): string {
  const path = live ? 's3/live' : 's3';
  return `https://www.chl.hockey/api/${path}?q=${resource}-${CHL_COMPETITION_ID}-${seasonId}.json`;
}
