import { NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateStatnetTeamStatsToDomain } from '../../utils/translators/statnetToDomain';
import { StatnetTeamStats } from '../../types/statnet/standings';
import { StandingsData } from '../../types/domain/standings';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('shl-standings');

    const data = await getCachedData(cacheKey, async () => {
        const url = 'https://www.shl.se/api/statistics-v2/stats-info/standings_standings?count=25&ssgtUuid=iuzqg7dqk9&provider=statnet';
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
      const statnetData = rawData[0];

      // Translate to domain model
      const domainData: StandingsData = {
        dataColumns: statnetData.dataColumns,
        stats: statnetData.stats.map((stat: StatnetTeamStats) => translateStatnetTeamStatsToDomain(stat))
      };

      return domainData;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
