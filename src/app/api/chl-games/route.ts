import { NextRequest, NextResponse } from 'next/server';
import { CHLService } from '../../services/chlService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming';
    const date = searchParams.get('date');

    let games;

    switch (type) {
      case 'upcoming':
        games = await CHLService.getUpcomingGames();
        break;
      case 'recent':
        games = await CHLService.getRecentGames();
        break;
      case 'date':
        if (!date) {
          return NextResponse.json(
            { error: 'Date parameter is required for date type' },
            { status: 400 }
          );
        }
        games = await CHLService.getGamesByDate(date);
        break;
      default:
        games = await CHLService.getUpcomingGames();
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error in CHL games API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CHL games' },
      { status: 500 }
    );
  }
}
