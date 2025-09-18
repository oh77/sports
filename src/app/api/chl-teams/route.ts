import { NextRequest, NextResponse } from 'next/server';
import { CHLTeamsApiResponse } from '../../types/chl';

const CHL_TEAMS_URL = 'https://www.chl.hockey/api/s3?q=teams-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(CHL_TEAMS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CHLTeamsApiResponse = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'No teams data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CHL teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL teams' },
      { status: 500 }
    );
  }
}
