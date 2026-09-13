import { NextResponse } from 'next/server';
import { CURRENT_CHL_SEASON } from '../../config/chl';
import { NHL_TEAMS } from '../../config/nhlTeams';
import type { StatnetLeague } from '../../config/statnet';
import { getAllTeams as getAllCHLTeams } from '../../services/chlService';
import type { League } from '../../types/domain/league';
import type { TeamInfo } from '../../types/domain/team';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet } from '../../utils/statnetSource';
import { extractStatnetTeams } from '../../utils/statnetTransforms';
import { translateCHLTeamToDomain } from '../../utils/translators/chlToDomain';
import { translateStatnetGameTeamToDomain } from '../../utils/translators/statnetToDomain';

const LOADERS: Record<League, () => Promise<TeamInfo[]>> = {
  shl: () => statnetTeams('shl'),
  sdhl: () => statnetTeams('sdhl'),
  ha: () => statnetTeams('ha'),
  chl: async () => {
    const teams = await getAllCHLTeams(CURRENT_CHL_SEASON.seasonId);
    if (teams.length === 0) throw new Error('No CHL teams available');
    return teams.map(translateCHLTeamToDomain);
  },
  nhl: async () => NHL_TEAMS,
};

/**
 * The clubs of every league (current season) as domain `TeamInfo`, with the
 * same team codes the games carry. A league that fails to load is left out.
 *
 * Consumed server-to-server by the gameday app.
 */
export async function GET() {
  const leagues = await Promise.all(
    Object.entries(LOADERS).map(async ([league, load]) => {
      try {
        return [{ league, teams: (await load()).filter((team) => team.code) }];
      } catch (error) {
        console.error(`teams: ${league} failed:`, error);
        return [];
      }
    }),
  );

  return NextResponse.json({ leagues: leagues.flat() });
}

async function statnetTeams(league: StatnetLeague): Promise<TeamInfo[]> {
  const data = await fetchStatnet<StatnetLeagueResponse>(league, 'teams');
  return extractStatnetTeams(data).map(translateStatnetGameTeamToDomain);
}
