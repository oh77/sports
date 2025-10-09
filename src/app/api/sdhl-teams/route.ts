import { NextResponse } from 'next/server';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { StatnetLeagueResponse, StatnetGameTeamInfo } from '../../types/statnet/game';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('sdhl-teams');

    const teams = await getCachedData(cacheKey, async (): Promise<StatnetGameTeamInfo[]> => {
      const response = await fetch('https://www.sdhl.se/api/sports-v2/game-schedule?seasonUuid=xs4m9qupsi&seriesUuid=qQ9-f438G8BXP&gameTypeUuid=qQ9-af37Ti40B&gamePlace=all&played=all', {
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

      const data: StatnetLeagueResponse = await response.json();
      const games = data.gameInfo || [];

      if (games.length === 0) {
        throw new Error('No games data available');
      }

      // Extract unique teams from games - return Statnet models
      const teamMap = new Map<string, StatnetGameTeamInfo>();

      games.forEach(game => {
        const homeCode = game.homeTeamInfo.names?.code || game.homeTeamInfo.code;
        const awayCode = game.awayTeamInfo.names?.code || game.awayTeamInfo.code;

        if (!teamMap.has(homeCode)) {
          teamMap.set(homeCode, game.homeTeamInfo);
        }
        if (!teamMap.has(awayCode)) {
          teamMap.set(awayCode, game.awayTeamInfo);
        }
      });

      return Array.from(teamMap.values());
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching SDHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SDHL teams' },
      { status: 500 }
    );
  }
}

