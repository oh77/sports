import { NextResponse } from 'next/server';
import { ALL_LEAGUES } from '@/app/config/leagues';
import { getTeams } from '@/app/services/leagueData';

/**
 * The teams of every league (current season) as domain `TeamInfo`, with the
 * same team codes the matches carry. A league that fails to load is left out.
 *
 * Consumed server-to-server by the gameday app.
 */
export async function GET() {
  const leagues = await Promise.all(
    ALL_LEAGUES.map(async (league) => {
      try {
        return [{ league, teams: await getTeams(league) }];
      } catch (error) {
        console.error(`teams: ${league} failed:`, error);
        return [];
      }
    }),
  );

  return NextResponse.json({ leagues: leagues.flat() });
}
