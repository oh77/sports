import { NextResponse } from 'next/server';
import { CHLStandingsApiResponse } from '../../types/chl/standings';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { StandingsData, TeamStats, DataColumn } from '../../types/domain/standings';

const CHL_STANDINGS_URL = 'https://www.chl.hockey/api/s3/live?q=standings-groups-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('chl-standings');

    const domainData = await getCachedData(cacheKey, async (): Promise<StandingsData> => {
      const response = await fetch(CHL_STANDINGS_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CHLStandingsApiResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No standings data available');
      }

      // Transform the data directly to domain model
      const standingsData = data.data[0]; // Get the first (and likely only) standings group

      // Helper function to get CHL team logo URL
      const getCHLLogoUrl = (externalId?: string): string => {
        if (externalId && externalId !== 'n/a' && externalId !== '') {
          return `https://res.cloudinary.com/chl-production/image/upload/c_fit,dpr_2.0,f_webp,g_center,h_100,q_auto/v1/chl-prod/assets/teams/${externalId}`;
        }
        return '';
      };

      const teamStats: TeamStats[] = standingsData.teams.map(team => ({
        Rank: team.stats.place,
        Team: 0, // CHL doesn't have a Team number field
        GP: team.stats.matches.played.total,
        W: team.stats.matches.won.total,
        T: team.stats.matches.drawn,
        L: team.stats.matches.lost.total,
        G: team.stats.goals.scored.total,
        GPG: team.stats.matches.played.total > 0 ? (team.stats.goals.scored.total / team.stats.matches.played.total).toFixed(2) : '0.00',
        GA: team.stats.goals.conceded.total,
        GAPG: team.stats.matches.played.total > 0 ? (team.stats.goals.conceded.total / team.stats.matches.played.total).toFixed(2) : '0.00',
        OTW: team.stats.matches.won.overtimes,
        OTL: team.stats.matches.lost.overtimes,
        SOW: 0, // CHL doesn't provide shootout wins separately
        SOL: 0, // CHL doesn't provide shootout losses separately
        Points: team.stats.points,
        info: {
          code: team.shortName,
          externalId: team.externalId,
          short: team.shortName,
          long: team.name,
          full: team.name,
          logo: getCHLLogoUrl(team.externalId)
        }
      }));

      const dataColumns: DataColumn[] = [
        { name: 'Rank', type: 'number', highlighted: true, group: 'position' },
        { name: 'Team', type: 'string', highlighted: true, group: 'team' },
        { name: 'GP', type: 'number', highlighted: false, group: 'games' },
        { name: 'W', type: 'number', highlighted: false, group: 'games' },
        { name: 'T', type: 'number', highlighted: false, group: 'games' },
        { name: 'L', type: 'number', highlighted: false, group: 'games' },
        { name: 'G', type: 'number', highlighted: false, group: 'goals' },
        { name: 'GPG', type: 'string', highlighted: false, group: 'goals' },
        { name: 'GA', type: 'number', highlighted: false, group: 'goals' },
        { name: 'GAPG', type: 'string', highlighted: false, group: 'goals' }
      ];

      return {
        dataColumns,
        stats: teamStats
      };
    });

    return NextResponse.json(domainData);
  } catch (error) {
    console.error('Error fetching CHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL standings' },
      { status: 500 }
    );
  }
}
