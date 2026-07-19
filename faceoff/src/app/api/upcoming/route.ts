import { NextResponse } from 'next/server';
import { CURRENT_CHL_SEASON } from '../../config/chl';
import type { StatnetLeague } from '../../config/statnet';
import { getAllUpcomingGames } from '../../services/chlService';
import type { GameInfo } from '../../types/domain/game';
import type { League } from '../../types/domain/league';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet } from '../../utils/statnetSource';
import { translateCHLGamesToDomainResponse } from '../../utils/translators/chlToDomain';
import { translateStatnetGameToDomain } from '../../utils/translators/statnetToDomain';

const STATNET_LEAGUES: StatnetLeague[] = ['shl', 'sdhl', 'ha'];

type LeagueGame = { league: League; game: GameInfo };

/**
 * Combined upcoming games across all leagues (current season), soonest first.
 * Aggregated server-side so the landing page makes a single small request.
 */
export async function GET(request: Request) {
  const limitParam = new URL(request.url).searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50);
  const now = Date.now();

  try {
    const statnet = await Promise.all(
      STATNET_LEAGUES.map(async (league): Promise<LeagueGame[]> => {
        try {
          const data = await fetchStatnet<StatnetLeagueResponse>(
            league,
            'games',
          );
          return (data.gameInfo || [])
            .map(translateStatnetGameToDomain)
            .map((game) => ({ league, game }));
        } catch {
          return [];
        }
      }),
    );

    let chl: LeagueGame[] = [];
    try {
      const chlGames = await getAllUpcomingGames(CURRENT_CHL_SEASON.seasonId);
      chl = (translateCHLGamesToDomainResponse(chlGames).gameInfo || []).map(
        (game) => ({ league: 'chl' as League, game }),
      );
    } catch {
      chl = [];
    }

    const sorted = [...statnet.flat(), ...chl]
      .filter(({ game }) => new Date(game.startDateTime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.game.startDateTime).getTime() -
          new Date(b.game.startDateTime).getTime(),
      );

    // Loose limit: reach at least `limit` games, but never split a calendar
    // day — once the limit is met, finish out the current day before stopping.
    const games: LeagueGame[] = [];
    let currentDay: string | null = null;
    for (const item of sorted) {
      const day = new Date(item.game.startDateTime).toDateString();
      if (day !== currentDay) {
        if (games.length >= limit) break;
        currentDay = day;
      }
      games.push(item);
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching combined upcoming games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming games' },
      { status: 500 },
    );
  }
}
