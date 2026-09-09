import { NextResponse } from 'next/server';
import {
  fetchStatnet,
  FULL_GOALIE_COUNT,
  getSeasonParam,
  wantsFullList,
} from '../../utils/statnetSource';
import { transformGoalies } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const teamCode = new URL(request.url).searchParams.get('teamCode');
    const raw = await fetchStatnet('ha', 'goalies', {
      season: getSeasonParam(request),
      count: wantsFullList(request) ? FULL_GOALIE_COUNT : undefined,
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
