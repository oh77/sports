import { currentSeason } from '@/app/config/leagues';
import type { League } from '@/app/types/domain/league';

/**
 * Helpers for building internal league URLs. All leagues carry a season
 * segment (e.g. `/pl/25-26/...`); when `season` is omitted the league's
 * current season is used.
 */

export function leagueBasePath(league: League, season?: string | null): string {
  return `/${league}/${season ?? currentSeason(league).key}`;
}

export function standingsPath(league: League, season?: string | null): string {
  return `${leagueBasePath(league, season)}/standings`;
}

export function statsPath(league: League, season?: string | null): string {
  return `${leagueBasePath(league, season)}/stats`;
}

export function teamPath(
  league: League,
  season: string | null | undefined,
  teamCode: string,
): string {
  return `${leagueBasePath(league, season)}/${encodeURIComponent(teamCode)}`;
}

/**
 * Canonicalize a team code for comparison. Route params carrying Nordic
 * characters (e.g. `mjä`) can arrive percent-encoded and/or in a different
 * Unicode normalization form than the API-derived code — `ä` may be a single
 * codepoint (NFC) on one side and `a` + combining diaeresis (NFD) on the
 * other, so a strict `===` misses. We decode, normalize to NFC, and lowercase.
 *
 * NFC preserves the diacritic (it does not fold `ä`→`a`), so distinct codes
 * like `mjä` and `mja` stay distinct.
 */
export function canonicalTeamCode(raw: string): string {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Already-decoded value containing a stray `%` — use it as-is.
  }
  return decoded.normalize('NFC').toLowerCase();
}

/** Whether a route param refers to the given team code (normalization-safe). */
export function teamCodeMatches(code: string, param: string): boolean {
  return canonicalTeamCode(code) === canonicalTeamCode(param);
}

/** Append `?season=`/`&season=` to an API URL when a season is set. */
export function withSeason(url: string, season?: string | null): string {
  if (!season) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}season=${encodeURIComponent(season)}`;
}
