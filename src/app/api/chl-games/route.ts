import { type NextRequest, NextResponse } from 'next/server';
import {
  getAllGames,
  getAllRecentGames,
  getAllUpcomingGames,
  getGamesByDate,
  getRecentGames,
  getUpcomingGames,
} from '../../services/chlService';
import type { CHLGame } from '../../types/chl/game';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateCHLGamesToDomainResponse } from '../../utils/translators/chlToDomain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming';
    const date = searchParams.get('date');

    // Generate cache key with parameters
    const cacheKey = generateCacheKey('chl-games', {
      type,
      ...(date && { date }),
    });

    // Get cached data or fetch fresh data
    const result = await getCachedData(cacheKey, async () => {
      let games: CHLGame[];

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
          games = await getAllGames();
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

      // Translate CHL games to domain models
      return translateCHLGamesToDomainResponse(games);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in CHL games API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL games' },
      { status: 500 },
    );
  }
}
