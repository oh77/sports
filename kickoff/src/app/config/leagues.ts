import type { League } from '@/app/types/domain/league';

export const ALL_LEAGUES: League[] = ['allsvenskan', 'pl', 'cl'];

export function isLeague(value: string): value is League {
  return (ALL_LEAGUES as string[]).includes(value);
}

/**
 * Per-season configuration. Provider-specific season ids are added per league
 * when the external API integrations land (see the checkpoint protocol in
 * CLAUDE.md); until then a season is just its URL-facing key.
 */
export type SeasonConfig = {
  /**
   * URL-facing season key. Formats differ per league: Allsvenskan runs over a
   * calendar year ("2026") while PL/CL run across years ("25-26").
   */
  key: string;
  /** Marks the season used when no explicit season is requested. */
  current?: boolean;
  /**
   * Season id in the league's external API (e.g. pulselive uses the starting
   * year: "2025" is the 25-26 season). Absent while a league runs on fixtures.
   */
  externalId?: string;
};

/**
 * Known seasons per league, newest first. Mark exactly one per league as
 * `current`. Seasons are per-league because they do not align across
 * calendars: Allsvenskan 2026 overlaps both PL/CL 25-26 and 26-27.
 */
export const LEAGUE_SEASONS: Record<League, SeasonConfig[]> = {
  allsvenskan: [{ key: '2026', current: true }, { key: '2025' }],
  pl: [
    { key: '26-27', externalId: '2026' },
    { key: '25-26', current: true, externalId: '2025' },
    { key: '24-25', externalId: '2024' },
  ],
  cl: [{ key: '25-26', current: true }, { key: '24-25' }],
};

export function currentSeason(league: League): SeasonConfig {
  const seasons = LEAGUE_SEASONS[league];
  return seasons.find((s) => s.current) ?? seasons[0];
}

/**
 * Resolve a season key to its config, falling back to the current season for
 * missing or unknown keys.
 */
export function resolveSeason(
  league: League,
  key?: string | null,
): SeasonConfig {
  if (!key) return currentSeason(league);
  return (
    LEAGUE_SEASONS[league].find((s) => s.key === key) ?? currentSeason(league)
  );
}

/** True if the key names a season that exists for the league. */
export function isSeason(league: League, key: string): boolean {
  return LEAGUE_SEASONS[league].some((s) => s.key === key);
}

/** Human-friendly label, e.g. "25-26" -> "2025/26", "2026" -> "2026". */
export function seasonLabel(key: string): string {
  const [start, end] = key.split('-');
  return start && end ? `20${start}/${end}` : key;
}
