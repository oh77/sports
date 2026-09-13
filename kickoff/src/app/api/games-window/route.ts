import { NextResponse } from 'next/server';
import { ALL_LEAGUES } from '@/app/config/leagues';
import { getMatches } from '@/app/services/leagueData';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import { dateKeyFromString, todayDateKey } from '@/app/utils/dateUtils';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_DAYS = 3;
const MAX_DAYS = 120;

/**
 * Every match across all leagues (current season) whose kick-off falls on a
 * Swedish calendar day in `from`..`to` (YYYY-MM-DD, inclusive), chronological
 * and regardless of state. Defaults to today plus the next two days.
 *
 * Consumed server-to-server by the gameday app.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = params.get('from') ?? todayDateKey();
  const to = params.get('to') ?? addDays(from, DEFAULT_DAYS - 1);

  if (
    !DATE_KEY.test(from) ||
    !DATE_KEY.test(to) ||
    to < from ||
    to > addDays(from, MAX_DAYS)
  ) {
    return NextResponse.json(
      { error: `from/to must be YYYY-MM-DD, at most ${MAX_DAYS} days apart` },
      { status: 400 },
    );
  }

  const perLeague = await Promise.all(
    ALL_LEAGUES.map(async (league) => {
      try {
        return (await getMatches(league)).matches.map(
          (game): { league: League; game: MatchInfo } => ({ league, game }),
        );
      } catch (error) {
        console.error(`games-window: ${league} failed:`, error);
        return [];
      }
    }),
  );

  const games = perLeague
    .flat()
    .filter(({ game }) => {
      const day = dateKeyFromString(game.startDateTime);
      return day >= from && day <= to;
    })
    .sort((a, b) => a.game.startDateTime.localeCompare(b.game.startDateTime));

  return NextResponse.json({ from, to, games });
}

function addDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}
