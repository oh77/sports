import { NextResponse } from 'next/server';
import { CHLTeamsApiResponse } from '../../types/chl/game';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateCHLTeamToDomain } from '../../utils/translators/chlToDomain';
import { TeamInfo } from '../../types/domain/team';

const CHL_TEAMS_URL = 'https://www.chl.hockey/api/s3?q=teams-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('chl-teams');

    const domainTeams = await getCachedData(cacheKey, async (): Promise<TeamInfo[]> => {
      const response = await fetch(CHL_TEAMS_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CHLTeamsApiResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No teams data available');
      }

      // Translate CHL teams to domain models
      return data.data.map(translateCHLTeamToDomain);
    });

    return NextResponse.json(domainTeams);
  } catch (error) {
    console.error('Error fetching CHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL teams' },
      { status: 500 }
    );
  }
}
