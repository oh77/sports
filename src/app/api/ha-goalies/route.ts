import { NextResponse } from 'next/server';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { transformGoalies } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const teamCode = new URL(request.url).searchParams.get('teamCode');
    const raw = await fetchStatnet('ha', 'goalies', {
      season: getSeasonParam(request),
    });
    return NextResponse.json(transformGoalies(raw, teamCode));
  } catch (error) {
    console.error('Error fetching HA goalie stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goalie statistics' },
      { status: 500 },
    );
  }
}
