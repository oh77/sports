import { NextResponse } from 'next/server';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { transformStandings } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const raw = await fetchStatnet('sdhl', 'standings', {
      season: getSeasonParam(request),
    });
    return NextResponse.json(transformStandings(raw));
  } catch (error) {
    console.error('Error fetching SDHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 },
    );
  }
}
