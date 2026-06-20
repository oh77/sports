import { NextResponse } from 'next/server';
import { chlResourceUrl, resolveChlSeason } from '../../config/chl';
import type { CHLTeamsApiResponse } from '../../types/chl/game';
import type { TeamInfo } from '../../types/domain/team';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateCHLTeamToDomain } from '../../utils/translators/chlToDomain';

export async function GET(request: Request) {
  try {
    const season = resolveChlSeason(
      new URL(request.url).searchParams.get('season'),
    );
    const cacheKey = generateCacheKey('chl-teams', { season: season.key });

    const domainTeams = await getCachedData(
      cacheKey,
      async (): Promise<TeamInfo[]> => {
        const response = await fetch(chlResourceUrl('teams', season.seasonId));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CHLTeamsApiResponse = await response.json();

        if (!data.data || data.data.length === 0) {
          throw new Error('No teams data available');
        }

        // Translate CHL teams to domain models
        return data.data.map(translateCHLTeamToDomain);
      },
    );

    return NextResponse.json(domainTeams);
  } catch (error) {
    console.error('Error fetching CHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL teams' },
      { status: 500 },
    );
  }
}
