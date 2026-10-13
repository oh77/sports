import { NextResponse } from 'next/server';
import {
  FULL_GOALIE_COUNT,
  fetchStatnet,
  getSeasonParam,
  wantsFullList,
} from '../../utils/statnetSource';
import { transformGoalies } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const teamCode = new URL(request.url).searchParams.get('teamCode');
    const raw = await fetchStatnet('shl', 'goalies', {
      season: getSeasonParam(request),
      // A team filter needs the whole leaderboard, not just the league's top.
      count: teamCode || wantsFullList(request) ? FULL_GOALIE_COUNT : undefined,
    });
    return NextResponse.json(transformGoalies(raw, teamCode));
  } catch (error) {
    console.error('Error fetching SHL goalie stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goalie statistics' },
      { status: 500 },
    );
  }
}
