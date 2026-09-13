import { SPORTS, UPSTREAMS } from '@/app/config/upstreams';
import type { League, Sport } from '@/app/types/domain/league';
import type { Team } from '@/app/types/domain/team';
import type { TeamsResponse } from '@/app/types/upstream/teams';
import { teamsToDomain } from '@/app/utils/translators/teamsToDomain';

const TIMEOUT_MS = 20_000;

/**
 * Teams per league from kickoff and faceoff. A league is absent when its
 * upstream app (or the league's provider) could not be reached.
 */
export async function getTeamsByLeague(): Promise<
  Partial<Record<League, Team[]>>
> {
  const perSport = await Promise.all(
    SPORTS.map(async (sport) => {
      try {
        return await fetchTeams(sport);
      } catch (error) {
        console.error(`Failed to fetch ${sport} teams:`, error);
        return {};
      }
    }),
  );
  return Object.assign({}, ...perSport);
}

async function fetchTeams(
  sport: Sport,
): Promise<Partial<Record<League, Team[]>>> {
  const { baseUrl } = UPSTREAMS[sport];
  const url = `${baseUrl}/api/teams`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  const data: TeamsResponse = await response.json();
  return teamsToDomain(sport, baseUrl, data);
}
