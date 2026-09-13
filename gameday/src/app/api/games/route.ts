import { NextResponse } from 'next/server';
import { isLeague } from '@/app/config/leagues';
import { getLeagueGames } from '@/app/services/scheduleService';

export const dynamic = 'force-dynamic';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `GET /api/games?league&from&to` — one league's games on Swedish calendar
 * days `from`..`to`, as gameday `Game[]`. Called from the browser by the
 * upcoming page so each league shows up as soon as it has loaded. 502 when the
 * league's upstream app is unavailable.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const league = params.get('league');
  const from = params.get('from');
  const to = params.get('to');

  if (
    !league ||
    !isLeague(league) ||
    !from ||
    !to ||
    !DATE_KEY.test(from) ||
    !DATE_KEY.test(to)
  ) {
    return NextResponse.json(
      { error: 'league must be known and from/to YYYY-MM-DD' },
      { status: 400 },
    );
  }

  try {
    const games = await getLeagueGames(league, from, to);
    return NextResponse.json(
      { games },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error(`Failed to fetch ${league} games:`, error);
    return NextResponse.json(
      { error: `${league} is unavailable` },
      { status: 502 },
    );
  }
}
