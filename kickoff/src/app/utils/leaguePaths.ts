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

/** Append `?season=`/`&season=` to an API URL when a season is set. */
export function withSeason(url: string, season?: string | null): string {
  if (!season) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}season=${encodeURIComponent(season)}`;
}
