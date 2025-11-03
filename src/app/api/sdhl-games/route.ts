import { NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('sdhl-games');

    const data = await getCachedData(cacheKey, async () => {
      const response = await fetch(
        'https://www.sdhl.se/api/sports-v2/game-schedule?seasonUuid=xs4m9qupsi&seriesUuid=qQ9-f438G8BXP&gameTypeUuid=qQ9-af37Ti40B&gamePlace=all&played=all',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: 'https://www.sdhl.se/',
            Origin: 'https://www.sdhl.se',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SDHL games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 },
    );
  }
}
