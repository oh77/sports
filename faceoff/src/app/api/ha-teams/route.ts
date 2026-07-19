import { NextResponse } from 'next/server';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { extractStatnetTeams } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const data = await fetchStatnet<StatnetLeagueResponse>('ha', 'teams', {
      season: getSeasonParam(request),
    });
    return NextResponse.json({ teams: extractStatnetTeams(data) });
  } catch (error) {
    console.error('Error fetching HA teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HA teams' },
      { status: 500 },
    );
  }
}
