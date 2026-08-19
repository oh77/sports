import { NextResponse } from 'next/server';
import { resolveNhlSeason } from '../../config/nhl';
import { getLeagueRoster, getTeamRoster } from '../../services/nhlService';
import type { RosterData } from '../../types/domain/roster';
import { countryCodeToAlpha2 } from '../../utils/countryCode';

/**
 * NHL rosters.
 *
 * Query params:
 *  - `season`   season key (e.g. "26-27"); falls back to the current season
 *  - `teamCode` limit to one club (e.g. "BUF")
 *  - `country`  limit to one nationality, as either an ISO alpha-2 code ("SE")
 *               or the provider's three-letter code ("SWE")
 *
 * Rosters are cached for a day in the service, so this is cheap to poll.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = resolveNhlSeason(searchParams.get('season'));
    const teamCode = searchParams.get('teamCode');
    const country = searchParams.get('country');

    const players = teamCode
      ? await getTeamRoster(teamCode, season.seasonId)
      : await getLeagueRoster(season.seasonId);

    // Compare on alpha-2 so "SE" and "SWE" both work.
    const wanted = country ? countryCodeToAlpha2(country) : null;
    const result: RosterData = {
      ...(teamCode ? { teamCode: teamCode.toUpperCase() } : {}),
      players: wanted
        ? players.filter((p) => p.nationality === wanted)
        : players,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching NHL rosters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL rosters' },
      { status: 500 },
    );
  }
}
