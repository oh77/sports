import { NextResponse } from 'next/server';
import { CURRENT_CHL_SEASON } from '../../config/chl';
import type { StatnetLeague } from '../../config/statnet';
import { getAllGames as getAllCHLGames } from '../../services/chlService';
import { getAllGames as getAllNHLGames } from '../../services/nhlService';
import type { GameInfo } from '../../types/domain/game';
import type { League } from '../../types/domain/league';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet } from '../../utils/statnetSource';
import { translateCHLGamesToDomainResponse } from '../../utils/translators/chlToDomain';
import { translateNHLGamesToDomainResponse } from '../../utils/translators/nhlToDomain';
import { translateStatnetGameToDomain } from '../../utils/translators/statnetToDomain';

const STATNET_LEAGUES: StatnetLeague[] = ['shl', 'sdhl', 'ha'];

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
 * Consumed server-to-server by the gameday app. NHL coverage is bounded by the
 * schedule walk in `nhlService` (a few weeks either side of today).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const today = dateKey(new Date());
  const from = params.get('from') ?? today;
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

  const statnet = await Promise.all(
    STATNET_LEAGUES.map(async (league): Promise<LeagueGame[]> => {
      try {
        const data = await fetchStatnet<StatnetLeagueResponse>(league, 'games');
        return (data.gameInfo || [])
          .map(translateStatnetGameToDomain)
          .map((game) => ({ league, game }));
      } catch (error) {
        console.error(`games-window: ${league} failed:`, error);
        return [];
      }
    }),
  );

  const [chl, nhl] = await Promise.all([
    getAllCHLGames(CURRENT_CHL_SEASON.seasonId).then((games) =>
      (translateCHLGamesToDomainResponse(games).gameInfo || []).map(
        (game): LeagueGame => ({ league: 'chl', game }),
      ),
    ),
    getAllNHLGames().then((games) =>
      (translateNHLGamesToDomainResponse(games).gameInfo || []).map(
        (game): LeagueGame => ({ league: 'nhl', game }),
      ),
    ),
  ]);

  const games = [...statnet.flat(), ...chl, ...nhl]
    .filter(({ game }) => {
      const day = dateKey(new Date(game.startDateTime));
      return day >= from && day <= to;
    })
    .sort((a, b) => a.game.startDateTime.localeCompare(b.game.startDateTime));

  return NextResponse.json({ from, to, games });
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
