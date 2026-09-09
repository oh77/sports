import { NHL_TEAMS } from '../config/nhlTeams';
import { StatnetService } from '../services/statnetService';
import type { League } from '../types/domain/league';
import type { TeamInfo } from '../types/domain/team';

/**
 * The clubs of a league, as domain `TeamInfo` (logo included).
 *
 * NHL is not a Statnet league — its clubs are a static config list — while the
 * others are derived from the season's schedule via the teams API.
 */
export async function fetchLeagueTeams(
  league: League,
  season?: string,
): Promise<TeamInfo[]> {
  if (league === 'nhl') return NHL_TEAMS;
  return new StatnetService(league, season).fetchTeams();
}

/**
 * Index clubs by team code for lookups from feeds that carry only the code.
 * Codes are upper-cased on both sides, as the stats and schedule feeds don't
 * always agree on case.
 */
export function indexTeamsByCode(teams: TeamInfo[]): Map<string, TeamInfo> {
  return new Map(teams.map((team) => [team.code.toUpperCase(), team]));
}
