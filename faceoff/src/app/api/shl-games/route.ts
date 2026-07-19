import { NextResponse } from 'next/server';
import {
  fetchStatnet,
  getGameTypeParam,
  getSeasonParam,
} from '../../utils/statnetSource';

export async function GET(request: Request) {
  try {
    const data = await fetchStatnet('shl', 'games', {
      season: getSeasonParam(request),
      gameType: getGameTypeParam(request),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SHL games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 },
    );
  }
}
