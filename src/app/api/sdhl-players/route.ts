import { NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateStatnetPlayerStatsToDomain } from '../../utils/translators/statnetToDomain';
import { StatnetPlayerStatsData } from '../../types/statnet/player-stats';
import { PlayerStatsData } from '../../types/domain/player-stats';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '100');
    const teamCode = searchParams.get('teamCode');

    const cacheKey = generateCacheKey(`sdhl-players-points-${count}`);

    const data = await getCachedData(cacheKey, async () => {
      const url = `https://www.sdhl.se/api/statistics-v2/stats-info/players_point?count=${count}&ssgtUuid=n5mqrxbg0g&provider=impleo&state=active&moduleType=summary`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.sdhl.se/',
          'Origin': 'https://www.sdhl.se'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      const statnetData: StatnetPlayerStatsData = rawData[0];

      // Translate to domain model
      let domainData: PlayerStatsData = {
        dataColumns: statnetData.dataColumns,
        defaultSortKey: statnetData.defaultSortKey,
        stats: statnetData.stats.map(translateStatnetPlayerStatsToDomain)
      };

      // Filter by team if teamCode is provided
      if (teamCode) {
        domainData = {
          ...domainData,
          stats: domainData.stats.filter(player =>
            player.info.team.code === teamCode
          )
        };
      }

      return domainData;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SDHL player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 }
    );
  }
}
