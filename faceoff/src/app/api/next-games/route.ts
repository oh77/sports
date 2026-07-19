import { NextResponse } from 'next/server';
import { CURRENT_CHL_SEASON } from '../../config/chl';
import type { StatnetLeague } from '../../config/statnet';
import { getAllUpcomingGames } from '../../services/chlService';
import type { League } from '../../types/domain/league';
import type { StatnetLeagueResponse } from '../../types/statnet/game';
import { fetchStatnet } from '../../utils/statnetSource';
import { translateCHLGamesToDomainResponse } from '../../utils/translators/chlToDomain';
import { translateStatnetGameToDomain } from '../../utils/translators/statnetToDomain';

const STATNET_LEAGUES: StatnetLeague[] = ['shl', 'sdhl', 'ha'];

/**
 * The start time (ISO) of each league's next upcoming game in the current
 * season, or null when a league has none. Unlike `/api/upcoming` this is not
 * day/limit-batched, so a league whose next game is far off still reports it.
 */
export async function GET() {
  const now = Date.now();
  const next: Record<League, string | null> = {
    shl: null,
    sdhl: null,
    ha: null,
    chl: null,
  };

  const earliest = (times: number[]): string | null => {
    const soonest = times.filter((t) => t >= now).sort((a, b) => a - b)[0];
    return soonest ? new Date(soonest).toISOString() : null;
  };

  await Promise.all(
    STATNET_LEAGUES.map(async (league) => {
      try {
        const data = await fetchStatnet<StatnetLeagueResponse>(league, 'games');
        next[league] = earliest(
          (data.gameInfo || [])
            .map(translateStatnetGameToDomain)
            .map((game) => new Date(game.startDateTime).getTime()),
        );
      } catch {
        next[league] = null;
      }
    }),
  );

  try {
    const chlGames = await getAllUpcomingGames(CURRENT_CHL_SEASON.seasonId);
    next.chl = earliest(
      (translateCHLGamesToDomainResponse(chlGames).gameInfo || []).map((game) =>
        new Date(game.startDateTime).getTime(),
      ),
    );
  } catch {
    next.chl = null;
  }

  return NextResponse.json({ next });
}
