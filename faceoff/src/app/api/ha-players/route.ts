import { NextResponse } from 'next/server';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { transformPlayers } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '50', 10);
    const teamCode = searchParams.get('teamCode');

    const raw = await fetchStatnet('ha', 'players', {
      season: getSeasonParam(request),
      count,
    });
    return NextResponse.json(transformPlayers(raw, teamCode));
  } catch (error) {
    console.error('Error fetching HA player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 },
    );
  }
}
