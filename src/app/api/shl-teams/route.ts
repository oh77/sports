import { NextResponse } from 'next/server';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { extractStatnetTeams } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const data = await fetchStatnet<StatnetLeagueResponse>('shl', 'teams', {
      season: getSeasonParam(request),
    });
    return NextResponse.json({ teams: extractStatnetTeams(data) });
  } catch (error) {
    console.error('Error fetching SHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SHL teams' },
      { status: 500 },
    );
  }
}
