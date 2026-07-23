/**
 * NHL configuration.
 *
 * The NHL schedule is fetched from the date-anchored endpoint
 *   https://api-web.nhle.com/v1/schedule/<YYYY-MM-DD>
 * which returns the game week containing the requested date. Unlike the CHL
 * API there is no single season-wide schedule resource, so the service walks
 * `nextStartDate` / `previousStartDate` pointers a bounded number of weeks.
 */

export const NHL_API_BASE = 'https://api-web.nhle.com/v1';

export type NhlSeasonConfig = {
  /** URL-facing season key, e.g. "26-27" (shared with the other leagues). */
  key: string;
  /** Marks the season used when no explicit season is requested. */
  current?: boolean;
  /** NHL season id, e.g. "20262027". */
  seasonId: string;
  /**
   * Date (YYYY-MM-DD) to query standings for this season. Set for a completed
   * season to its final-standings date. Omit for the ongoing season, which is
   * queried as of today so the table stays live.
   */
  standingsDate?: string;
  /**
   * Date (YYYY-MM-DD) to anchor the schedule walk for a completed season,
   * typically its preseason start. The games view walks forward from here.
   * Omit for the ongoing season, which anchors on today.
   */
  gamesAnchor?: string;
  /**
   * Date (YYYY-MM-DD) the playoffs ended. Set for a completed season — it
   * anchors the final-series walk (champion + best-of-7). For the ongoing
   * season this is read live from the schedule response instead.
   */
  playoffEndDate?: string;
};

/** Known NHL seasons. Add new seasons here; mark exactly one as `current`. */
export const NHL_SEASONS: NhlSeasonConfig[] = [
  { key: '26-27', current: true, seasonId: '20262027' },
  {
    key: '25-26',
    seasonId: '20252026',
    standingsDate: '2026-04-17',
    gamesAnchor: '2025-09-20',
    playoffEndDate: '2026-06-15',
  },
];

export const CURRENT_NHL_SEASON: NhlSeasonConfig =
  NHL_SEASONS.find((s) => s.current) ?? NHL_SEASONS[0];

/** Resolve a season key to its NHL config, falling back to the current season. */
export function resolveNhlSeason(key?: string | null): NhlSeasonConfig {
  if (!key) return CURRENT_NHL_SEASON;
  return NHL_SEASONS.find((s) => s.key === key) ?? CURRENT_NHL_SEASON;
}

/** Build the schedule URL for a given date (YYYY-MM-DD). */
export function nhlScheduleUrl(date: string): string {
  return `${NHL_API_BASE}/schedule/${date}`;
}

/** Build the standings URL for a given date (YYYY-MM-DD). */
export function nhlStandingsUrl(date: string): string {
  return `${NHL_API_BASE}/standings/${date}`;
}

/** Build a club's full-season schedule URL. */
export function nhlClubScheduleUrl(teamCode: string, seasonId: string): string {
  return `${NHL_API_BASE}/club-schedule-season/${teamCode.toUpperCase()}/${seasonId}`;
}

/**
 * Stats live on a different host from the schedule/standings web API.
 * Rows are filtered with a `cayenneExp` (regular season, single season) and
 * ordered with a `sort` JSON array.
 */
export const NHL_STATS_BASE = 'https://api.nhle.com/stats/rest/en';

type SortSpec = { property: string; direction: 'ASC' | 'DESC' }[];

// Top scorers: points, then goals, then assists, then playerId (stable).
const SKATER_SORT: SortSpec = [
  { property: 'points', direction: 'DESC' },
  { property: 'goals', direction: 'DESC' },
  { property: 'assists', direction: 'DESC' },
  { property: 'playerId', direction: 'ASC' },
];

// Top goalies: wins, then save %, then playerId (stable).
const GOALIE_SORT: SortSpec = [
  { property: 'wins', direction: 'DESC' },
  { property: 'savePct', direction: 'DESC' },
  { property: 'playerId', direction: 'ASC' },
];

function nhlStatsUrl(
  resource: 'skater' | 'goalie',
  sort: SortSpec,
  seasonId: string,
  limit: number,
): string {
  const sortParam = encodeURIComponent(JSON.stringify(sort));
  const cayenne = encodeURIComponent(
    `gameTypeId=2 and seasonId<=${seasonId} and seasonId>=${seasonId}`,
  );
  return `${NHL_STATS_BASE}/${resource}/summary?isAggregate=false&isGame=false&sort=${sortParam}&start=0&limit=${limit}&cayenneExp=${cayenne}`;
}

/** Build the skater-summary (top scorers) URL for a season. */
export function nhlSkaterStatsUrl(seasonId: string, limit = 50): string {
  return nhlStatsUrl('skater', SKATER_SORT, seasonId, limit);
}

/** Build the goalie-summary (top goalies) URL for a season. */
export function nhlGoalieStatsUrl(seasonId: string, limit = 50): string {
  return nhlStatsUrl('goalie', GOALIE_SORT, seasonId, limit);
}
