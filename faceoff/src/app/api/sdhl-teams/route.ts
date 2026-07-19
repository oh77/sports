import { NextResponse } from 'next/server';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { extractStatnetTeams } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const data = await fetchStatnet<StatnetLeagueResponse>('sdhl', 'teams', {
      season: getSeasonParam(request),
    });
    return NextResponse.json({ teams: extractStatnetTeams(data) });
  } catch (error) {
    console.error('Error fetching SDHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SDHL teams' },
      { status: 500 },
    );
  }
}
