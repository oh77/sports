import type { League } from '../types/domain/league';

/**
 * Helpers for building internal league URLs. Statnet leagues (SHL/SDHL) carry a
 * season segment (e.g. `/shl/25-26/...`); CHL and any season-less context pass
 * `season` as undefined, which omits the segment (e.g. `/chl/...`).
 */

export function leagueBasePath(league: League, season?: string | null): string {
  return season ? `/${league}/${season}` : `/${league}`;
}

export function teamPath(
  league: League,
  season: string | null | undefined,
  teamCode: string,
): string {
  return `${leagueBasePath(league, season)}/${encodeURIComponent(teamCode)}`;
}

export function vsPath(
  league: League,
  season: string | null | undefined,
  teamCode: string,
  opponentTeamCode: string,
): string {
  return `${teamPath(league, season, teamCode)}/vs/${encodeURIComponent(
    opponentTeamCode,
  )}`;
}

export function standingsPath(league: League, season?: string | null): string {
  return `${leagueBasePath(league, season)}/standings`;
}

/** Append `?season=`/`&season=` to an API URL when a season is set. */
export function withSeason(url: string, season?: string | null): string {
  if (!season) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}season=${encodeURIComponent(season)}`;
}
