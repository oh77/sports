import { NextResponse } from 'next/server';
import { fetchStatnet, getSeasonParam } from '../../utils/statnetSource';
import { transformStandings } from '../../utils/statnetTransforms';

export async function GET(request: Request) {
  try {
    const raw = await fetchStatnet('ha', 'standings', {
      season: getSeasonParam(request),
    });
    return NextResponse.json(transformStandings(raw));
  } catch (error) {
    console.error('Error fetching HA standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 },
    );
  }
}
