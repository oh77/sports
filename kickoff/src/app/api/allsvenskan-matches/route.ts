import { NextResponse } from 'next/server';
import { getMatches } from '@/app/services/leagueData';

export async function GET(request: Request) {
  const season = new URL(request.url).searchParams.get('season') ?? undefined;
  try {
    return NextResponse.json(await getMatches('allsvenskan', season));
  } catch (error) {
    console.error('allsvenskan-matches failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 502 },
    );
  }
}
