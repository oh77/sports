import { NextResponse } from 'next/server';
import { CURRENT_CHL_SEASON } from '../../config/chl';
import { getAllGames as getAllCHLGames } from '../../services/chlService';
import { getAllGames as getAllNHLGames } from '../../services/nhlService';
import type { GameInfo } from '../../types/domain/game';
import type { League } from '../../types/domain/league';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { toUtcIso } from '../../utils/dateUtils';
import { fetchStatnet } from '../../utils/statnetSource';
import { translateCHLGamesToDomainResponse } from '../../utils/translators/chlToDomain';
import { translateNHLGamesToDomainResponse } from '../../utils/translators/nhlToDomain';
import { translateStatnetGameToDomain } from '../../utils/translators/statnetToDomain';

const ALL_LEAGUES: League[] = ['shl', 'sdhl', 'ha', 'chl', 'nhl'];

const TIME_ZONE = 'Europe/Stockholm';
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_DAYS = 3;
const MAX_DAYS = 120;

type LeagueGame = { league: League; game: GameInfo };

/**
 * Every game across all leagues (current season) whose start falls on a
 * Swedish calendar day in `from`..`to` (YYYY-MM-DD, inclusive), chronological
 * and regardless of state. Defaults to today plus the next two days.
 *
 * Pass `league` to get a single league. Its source failing then answers 502
 * instead of an empty list, so a caller loading leagues one by one can tell
 * "no games" from "unavailable".
 *
 * Consumed server-to-server by the gameday app. NHL coverage is bounded by the
 * schedule walk in `nhlService` (a few weeks either side of today).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const today = dateKey(new Date());
  const from = params.get('from') ?? today;
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

  let all: LeagueGame[];
  if (league !== null) {
    try {
      all = await leagueGames(league);
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
          return await leagueGames(each);
        } catch (error) {
          console.error(`games-window: ${each} failed:`, error);
          return [];
        }
      }),
    );
    all = perLeague.flat();
  }

  const games = all
    // Consumers get UTC instants whatever the source sent (statnet is zone-less).
    .map(({ league, game }) => ({
      league,
      game: { ...game, startDateTime: toUtcIso(game.startDateTime) },
    }))
    .filter(({ game }) => {
      const day = dateKey(new Date(game.startDateTime));
      return day >= from && day <= to;
    })
    .sort((a, b) => a.game.startDateTime.localeCompare(b.game.startDateTime));

  return NextResponse.json({ from, to, games });
}

/** All of a league's games this season, from its own source. */
async function leagueGames(league: League): Promise<LeagueGame[]> {
  if (league === 'chl') {
    const games = await getAllCHLGames(CURRENT_CHL_SEASON.seasonId);
    return (translateCHLGamesToDomainResponse(games).gameInfo || []).map(
      (game) => ({ league, game }),
    );
  }
  if (league === 'nhl') {
    const games = await getAllNHLGames();
    return (translateNHLGamesToDomainResponse(games).gameInfo || []).map(
      (game) => ({ league, game }),
    );
  }
  const data = await fetchStatnet<StatnetLeagueResponse>(league, 'games');
  return (data.gameInfo || [])
    .map(translateStatnetGameToDomain)
    .map((game) => ({ league, game }));
}

function isLeague(value: string): value is League {
  return (ALL_LEAGUES as string[]).includes(value);
}

/** Swedish local calendar day (YYYY-MM-DD) of an instant. */
function dateKey(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });
}

function addDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}
