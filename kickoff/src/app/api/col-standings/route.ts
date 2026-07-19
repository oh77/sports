import { NextResponse } from 'next/server';
import { getStandings } from '@/app/services/leagueData';

export async function GET(request: Request) {
  const season = new URL(request.url).searchParams.get('season') ?? undefined;
  try {
    return NextResponse.json(await getStandings('col', season));
  } catch (error) {
    console.error('col-standings failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 502 },
    );
  }
}
