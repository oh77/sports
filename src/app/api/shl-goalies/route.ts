import { NextRequest, NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateStatnetGoalieStatsToDomain } from '../../utils/translators/statnetToDomain';
import { StatnetGoalieStatsData } from '../../types/statnet/goalie-stats';
import { GoalieStatsData } from '../../types/domain/goalie-stats';

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
      const statnetData: StatnetGoalieStatsData = Array.isArray(rawData) ? rawData[0] : rawData;

      // Translate to domain model
      let domainData: GoalieStatsData = {
        dataColumns: statnetData.dataColumns,
        defaultSortKey: statnetData.defaultSortKey,
        stats: statnetData.stats.map(translateStatnetGoalieStatsToDomain)
      };

      // Filter by team if teamCode is provided
      if (teamCode) {
        domainData = {
          ...domainData,
          stats: domainData.stats.filter(goalie => 
            goalie.info.team.code === teamCode
          )
        };
      }

      return domainData;
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
