import { NextResponse } from 'next/server';
import { CHLStandingsApiResponse, CHLStandingsDataTransformed, CHLStandingsTeam } from '../../types/chl-standings';
import { generateCacheKey, getCachedData } from '../../utils/cache';

const CHL_STANDINGS_URL = 'https://www.chl.hockey/api/s3/live?q=standings-groups-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET() {
  try {
    const cacheKey = generateCacheKey('chl-standings');

    const transformedData = await getCachedData(cacheKey, async (): Promise<CHLStandingsDataTransformed> => {
      const response = await fetch(CHL_STANDINGS_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CHLStandingsApiResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No standings data available');
      }

      // Transform the data to match our component structure
      const standingsData = data.data[0]; // Get the first (and likely only) standings group
      const transformedTeams: CHLStandingsTeam[] = standingsData.teams.map(team => ({
        rank: team.stats.place,
        name: team.name,
        shortName: team.shortName,
        externalId: team.externalId,
        points: team.stats.points,
        gamesPlayed: team.stats.matches.played.total,
        wins: team.stats.matches.won.total,
        losses: team.stats.matches.lost.total,
        ties: team.stats.matches.drawn,
        goalsFor: team.stats.goals.scored.total,
        goalsAgainst: team.stats.goals.conceded.total,
        goalDifference: team.stats.goals.scored.total - team.stats.goals.conceded.total,
        pointsPercentage: team.stats.pointsPercentage,
        logo: undefined // CHL API doesn't provide logos in standings data
      }));

      return {
        teams: transformedTeams,
        season: standingsData.stage.group.name,
        lastUpdated: new Date().toISOString()
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching CHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL standings' },
      { status: 500 }
    );
  }
}
