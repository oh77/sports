import { NextResponse } from 'next/server';
import {
  FULL_PLAYER_COUNT,
  fetchStatnet,
  getSeasonParam,
} from '../../utils/statnetSource';
import { transformPlayers } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');
    // A team filter needs the whole leaderboard, not just the league's top.
    const count = teamCode
      ? FULL_PLAYER_COUNT
      : parseInt(searchParams.get('count') || '100', 10);

    const raw = await fetchStatnet('sdhl', 'players', {
      season: getSeasonParam(request),
      count,
    });
    return NextResponse.json(transformPlayers(raw, teamCode));
  } catch (error) {
    console.error('Error fetching SDHL player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 },
    );
  }
}
