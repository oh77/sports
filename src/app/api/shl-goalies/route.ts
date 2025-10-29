import { NextRequest, NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');
    
    const cacheKey = generateCacheKey('shl-goalies-summary');

    const data = await getCachedData(cacheKey, async () => {
      const url = `https://www.shl.se/api/statistics-v2/stats-info/goalkeepers_summary?count=25&ssgtUuid=iuzqg7dqk9&provider=statnet`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.shl.se/',
          'Origin': 'https://www.shl.se'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      const goalieData = Array.isArray(rawData) ? rawData[0] : rawData;

      // Filter by team if teamCode is provided
      if (teamCode && goalieData.stats) {
        return {
          ...goalieData,
          stats: goalieData.stats.filter((goalie: any) => 
            goalie.info?.team?.code === teamCode
          )
        };
      }

      return goalieData;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SHL goalie stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goalie statistics' },
      { status: 500 }
    );
  }
}
