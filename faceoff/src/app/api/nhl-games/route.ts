import { type NextRequest, NextResponse } from 'next/server';
import { resolveNhlSeason } from '../../config/nhl';
import {
  getAllGames,
  getAllRecentGames,
  getAllUpcomingGames,
  getCurrentPlayoffEnd,
  getFinalsGames,
  getGamesByDate,
  getRecentGames,
  getTeamSeasonGames,
  getUpcomingGames,
} from '../../services/nhlService';
import type { NHLGame } from '../../types/nhl/game';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateNHLGamesToDomainResponse } from '../../utils/translators/nhlToDomain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming';
    const date = searchParams.get('date');
    const teamCode = searchParams.get('teamCode');
    const season = resolveNhlSeason(searchParams.get('season'));

    const cacheKey = generateCacheKey('nhl-games', {
      type,
      season: season.key,
      ...(date && { date }),
      ...(teamCode && { teamCode }),
    });

    const result = await getCachedData(cacheKey, async () => {
      let games: NHLGame[];

      switch (type) {
        case 'upcoming':
          games = await getUpcomingGames();
          break;
        case 'recent':
          games = await getRecentGames();
          break;
        case 'all-upcoming':
          games = await getAllUpcomingGames();
          break;
        case 'all-recent':
          games = await getAllRecentGames();
          break;
        case 'all':
          games = await getAllGames(season.gamesAnchor);
          break;
        case 'finals': {
          // Past season: its configured playoff end. Ongoing season: the live
          // playoff end, but only once it has passed (season over).
          const anchor =
            season.playoffEndDate ?? (await getCurrentPlayoffEnd());
          games = anchor ? await getFinalsGames(anchor) : [];
          break;
        }
        case 'team':
          if (!teamCode) {
            throw new Error('teamCode parameter is required for team type');
          }
          games = await getTeamSeasonGames(teamCode, season.seasonId);
          break;
        case 'date':
          if (!date) {
            throw new Error('Date parameter is required for date type');
          }
          games = await getGamesByDate(date);
          break;
        default:
          games = await getUpcomingGames();
      }

      return translateNHLGamesToDomainResponse(games);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in NHL games API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL games' },
      { status: 500 },
    );
  }
}
