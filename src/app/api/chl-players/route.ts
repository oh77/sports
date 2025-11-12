import { NextResponse } from 'next/server';
import type { CHLPlayerStatsApiResponse } from '../../types/chl/player-stats';
import type { PlayerStatsData } from '../../types/domain/player-stats';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateCHLPlayerStatsToDomain } from '../../utils/translators/statnetToDomain';

const CHL_PLAYERS_URL =
  'https://www.chl.hockey/api/s3?q=statistic-players-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');

    const cacheKey = generateCacheKey('chl-players-points');

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<PlayerStatsData> => {
        const response = await fetch(CHL_PLAYERS_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CHLPlayerStatsApiResponse = await response.json();

        if (!data.data || data.data.length === 0) {
          throw new Error('No player statistics data available');
        }

        // Transform CHL data to domain model
        // Data is already sorted by points (P), so we assign ranks based on position
        let domainStats = data.data.map((player, index) =>
          translateCHLPlayerStatsToDomain(player, index + 1),
        );

        // Filter by team if teamCode is provided
        if (teamCode) {
          domainStats = domainStats.filter(
            (player) =>
              player.info.team.code.toLowerCase() === teamCode.toLowerCase(),
          );
        }

        const dataColumns = [
          {
            name: 'Rank',
            type: 'number',
            highlighted: true,
            group: 'position',
          },
          {
            name: 'Player',
            type: 'string',
            highlighted: true,
            group: 'player',
          },
          { name: 'Team', type: 'string', highlighted: true, group: 'team' },
          { name: 'GP', type: 'number', highlighted: false, group: 'games' },
          { name: 'TP', type: 'number', highlighted: false, group: 'points' },
          { name: 'G', type: 'number', highlighted: false, group: 'points' },
          { name: 'A', type: 'number', highlighted: false, group: 'points' },
        ];

        return {
          dataColumns,
          defaultSortKey: {
            name: 'TP',
            order: 'desc',
          },
          stats: domainStats,
        };
      },
    );

    return NextResponse.json(domainData);
  } catch (error) {
    console.error('Error fetching CHL player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL player statistics' },
      { status: 500 },
    );
  }
}
