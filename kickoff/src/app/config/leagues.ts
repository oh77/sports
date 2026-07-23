import type { League } from '@/app/types/domain/league';

export const ALL_LEAGUES: League[] = ['allsvenskan', 'pl', 'cl', 'el', 'col'];

export function isLeague(value: string): value is League {
  return (ALL_LEAGUES as string[]).includes(value);
}

/** Per-season configuration. */
export type SeasonConfig = {
  /**
   * URL-facing season key. Formats differ per league: Allsvenskan runs over a
   * calendar year ("2026") while PL/CL run across years ("25-26").
   */
  key: string;
  /**
   * Season id in the league's external API (e.g. pulselive uses the starting
   * year: "2025" is the 25-26 season; UEFA uses the ending year).
   */
  externalId?: string;
};

/**
 * Known seasons per league, newest first. Seasons are per-league because they
 * do not align across calendars: Allsvenskan 2026 overlaps both PL/CL 25-26
 * and 26-27. The default season is computed from today's date — see
 * `currentSeason` — so add upcoming seasons here as soon as they exist in the
 * provider API.
 */
export const LEAGUE_SEASONS: Record<League, SeasonConfig[]> = {
  allsvenskan: [{ key: '2026' }, { key: '2025' }],
  pl: [
    { key: '26-27', externalId: '2026' },
    { key: '25-26', externalId: '2025' },
    { key: '24-25', externalId: '2024' },
  ],
  // UEFA's seasonYear is the year the season ends: 25-26 -> "2026".
  cl: [
    { key: '26-27', externalId: '2027' },
    { key: '25-26', externalId: '2026' },
    { key: '24-25', externalId: '2025' },
  ],
  // Europa League runs on the same UEFA API (seasonYear = end year).
  el: [
    { key: '26-27', externalId: '2027' },
    { key: '25-26', externalId: '2026' },
    { key: '24-25', externalId: '2025' },
  ],
  // Conference League runs on the same UEFA API (seasonYear = end year).
  col: [
    { key: '26-27', externalId: '2027' },
    { key: '25-26', externalId: '2026' },
    { key: '24-25', externalId: '2025' },
  ],
};

/**
 * Date span implied by a season key. Calendar-year keys ("2026") span the
 * year; cross-year keys ("25-26") span 1 July to 30 June, which matches when
 * European club seasons hand over.
 */
function seasonSpan(key: string): { start: number; end: number } {
  const cross = key.match(/^(\d{2})-(\d{2})$/);
  if (cross) {
    const startYear = 2000 + Number(cross[1]);
    return {
      start: Date.UTC(startYear, 6, 1),
      end: Date.UTC(startYear + 1, 5, 30, 23, 59, 59),
    };
  }
  const year = Number(key);
  return {
    start: Date.UTC(year, 0, 1),
    end: Date.UTC(year, 11, 31, 23, 59, 59),
  };
}

/**
 * The season used when no explicit season is requested:
 * a) the season in progress today,
 * b) otherwise the next upcoming season,
 * c) otherwise the most recently ended one.
 */
export function currentSeason(league: League): SeasonConfig {
  const now = Date.now();
  const seasons = LEAGUE_SEASONS[league];

  const active = seasons.find((s) => {
    const { start, end } = seasonSpan(s.key);
    return now >= start && now <= end;
  });
  if (active) return active;

  const upcoming = seasons
    .filter((s) => seasonSpan(s.key).start > now)
    .sort((a, b) => seasonSpan(a.key).start - seasonSpan(b.key).start)[0];
  if (upcoming) return upcoming;

  return seasons
    .slice()
    .sort((a, b) => seasonSpan(b.key).end - seasonSpan(a.key).end)[0];
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
