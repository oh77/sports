import { NextResponse } from 'next/server';
import { ALL_LEAGUES, isLeague } from '@/app/config/leagues';
import { getMatches } from '@/app/services/leagueData';
import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import { dateKeyFromString, todayDateKey } from '@/app/utils/dateUtils';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_DAYS = 3;
const MAX_DAYS = 120;

type LeagueMatch = { league: League; game: MatchInfo };

/**
 * Every match across all leagues (current season) whose kick-off falls on a
 * Swedish calendar day in `from`..`to` (YYYY-MM-DD, inclusive), chronological
 * and regardless of state. Defaults to today plus the next two days.
 *
 * Pass `league` to get a single league. Its provider failing then answers 502
 * instead of an empty list, so a caller loading leagues one by one can tell
 * "no matches" from "unavailable".
 *
 * Consumed server-to-server by the gameday app.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = params.get('from') ?? todayDateKey();
  const to = params.get('to') ?? addDays(from, DEFAULT_DAYS - 1);
  const league = params.get('league');

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
  if (league !== null && !isLeague(league)) {
    return NextResponse.json(
      { error: `unknown league "${league}"` },
      { status: 400 },
    );
  }

  let matches: LeagueMatch[];
  if (league !== null) {
    try {
      matches = await leagueMatches(league);
    } catch (error) {
      console.error(`games-window: ${league} failed:`, error);
      return NextResponse.json(
        { error: `${league} is unavailable` },
        { status: 502 },
      );
    }
  } else {
    const perLeague = await Promise.all(
      ALL_LEAGUES.map(async (each) => {
        try {
          return await leagueMatches(each);
        } catch (error) {
          console.error(`games-window: ${each} failed:`, error);
          return [];
        }
      }),
    );
    matches = perLeague.flat();
  }

  const games = matches
    .filter(({ game }) => {
      const day = dateKeyFromString(game.startDateTime);
      return day >= from && day <= to;
    })
    .sort((a, b) => a.game.startDateTime.localeCompare(b.game.startDateTime));

  return NextResponse.json({ from, to, games });
}

async function leagueMatches(league: League): Promise<LeagueMatch[]> {
  return (await getMatches(league)).matches.map((game) => ({ league, game }));
}

function addDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}
