import { isLeague, LEAGUES } from '@/app/config/leagues';
import type { League, Sport } from '@/app/types/domain/league';
import type { Team } from '@/app/types/domain/team';
import type { TeamsResponse } from '@/app/types/upstream/teams';

/**
 * Translate a kickoff/faceoff teams response into teams per league, sorted by
 * name and de-duplicated by code. Unknown (or wrong-sport) leagues are dropped.
 */
export function teamsToDomain(
  sport: Sport,
  baseUrl: string,
  response: TeamsResponse,
): Partial<Record<League, Team[]>> {
  const result: Partial<Record<League, Team[]>> = {};

  for (const { league, teams } of response.leagues) {
    if (!isLeague(league) || LEAGUES[league].sport !== sport) {
      console.warn(`Skipping teams from unknown ${sport} league "${league}"`);
      continue;
    }

    const byCode = new Map<string, Team>();
    for (const team of teams) {
      if (!team.code || byCode.has(team.code)) continue;
      byCode.set(team.code, {
        code: team.code,
        name: team.full || team.short || team.code,
        // Logos may be app-relative (e.g. kickoff's local assets).
        logo: team.logo ? new URL(team.logo, baseUrl).href : undefined,
      });
    }

    result[league] = [...byCode.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'sv'),
    );
  }

  return result;
}
