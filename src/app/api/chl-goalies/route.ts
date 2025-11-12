import { NextResponse } from 'next/server';
import type { CHLGoalieStatsApiResponse } from '../../types/chl/goalie-stats';
import type { GoalieStatsData } from '../../types/domain/goalie-stats';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateCHLGoalieStatsToDomain } from '../../utils/translators/statnetToDomain';

const CHL_GOALIES_URL =
  'https://www.chl.hockey/api/s3?q=statistic-goalkeepers-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');

    const cacheKey = generateCacheKey('chl-goalies-summary');

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<GoalieStatsData> => {
        const response = await fetch(CHL_GOALIES_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CHLGoalieStatsApiResponse = await response.json();

        if (!data.data || data.data.length === 0) {
          throw new Error('No goalie statistics data available');
        }

        // Transform CHL data to domain model
        // Data is already sorted by SVS%, so we assign ranks based on position
        let domainStats = data.data.map((goalie, index) =>
          translateCHLGoalieStatsToDomain(goalie, index + 1),
        );

        // Filter by team if teamCode is provided
        if (teamCode) {
          domainStats = domainStats.filter(
            (goalie) =>
              goalie.info.team.code.toLowerCase() === teamCode.toLowerCase(),
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
          { name: 'SVS', type: 'number', highlighted: false, group: 'saves' },
          { name: 'GA', type: 'number', highlighted: false, group: 'saves' },
          {
            name: 'SVSPerc',
            type: 'string',
            highlighted: false,
            group: 'saves',
          },
          { name: 'GAA', type: 'string', highlighted: false, group: 'saves' },
          { name: 'SO', type: 'number', highlighted: false, group: 'saves' },
        ];

        return {
          dataColumns,
          defaultSortKey: {
            name: 'SVSPerc',
            order: 'desc',
          },
          stats: domainStats,
        };
      },
    );

    return NextResponse.json(domainData);
  } catch (error) {
    console.error('Error fetching CHL goalie stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL goalie statistics' },
      { status: 500 },
    );
  }
}
