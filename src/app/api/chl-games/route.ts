import { NextRequest, NextResponse } from 'next/server';
import { CHLService } from '../../services/chlService';
import { generateCacheKey, getCachedData } from '../../utils/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming';
    const date = searchParams.get('date');

    // Generate cache key with parameters
    const cacheKey = generateCacheKey('chl-games', { type, ...(date && { date }) });

    // Get cached data or fetch fresh data
    const result = await getCachedData(cacheKey, async () => {
      let games;

      switch (type) {
        case 'upcoming':
          games = await CHLService.getUpcomingGames();
          break;
        case 'recent':
          games = await CHLService.getRecentGames();
          break;
        case 'all-upcoming':
          games = await CHLService.getAllUpcomingGames();
          break;
        case 'all-recent':
          games = await CHLService.getAllRecentGames();
          break;
        case 'all':
          games = await CHLService.getAllGames();
          break;
        case 'date':
          if (!date) {
            throw new Error('Date parameter is required for date type');
          }
          games = await CHLService.getGamesByDate(date);
          break;
        default:
          games = await CHLService.getUpcomingGames();
      }

      return { games };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in CHL games API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL games' },
      { status: 500 }
    );
  }
}
