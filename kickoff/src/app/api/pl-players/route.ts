import { NextResponse } from 'next/server';
import {
  getPlayerStats,
  type PlayerStatsSort,
} from '@/app/services/leagueData';

const SORTS: PlayerStatsSort[] = ['goals', 'assists', 'cards'];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const season = params.get('season') ?? undefined;
  const sortParam = params.get('sort') ?? 'goals';
  const sort = SORTS.includes(sortParam as PlayerStatsSort)
    ? (sortParam as PlayerStatsSort)
    : 'goals';

  try {
    return NextResponse.json(await getPlayerStats('pl', season, sort));
  } catch (error) {
    console.error('pl-players failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 502 },
    );
  }
}
