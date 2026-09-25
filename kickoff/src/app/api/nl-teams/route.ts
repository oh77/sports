import { NextResponse } from 'next/server';
import { getTeams } from '@/app/services/leagueData';

export async function GET(request: Request) {
  const season = new URL(request.url).searchParams.get('season') ?? undefined;
  try {
    return NextResponse.json(await getTeams('nl', season));
  } catch (error) {
    console.error('nl-teams failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 502 },
    );
  }
}
