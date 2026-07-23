import { NextResponse } from 'next/server';
import { nhlStandingsUrl, resolveNhlSeason } from '../../config/nhl';
import type { StandingsData, TeamStats } from '../../types/domain/standings';
import type { NhlStandingsResponse } from '../../types/nhl/standings';
import { generateCacheKey, getCachedData } from '../../utils/cache';

/** Today's date as a YYYY-MM-DD anchor for the standings endpoint. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function perGame(total: number, games: number): string {
  return games > 0 ? (total / games).toFixed(2) : '0.00';
}

export async function GET(request: Request) {
  try {
    const season = resolveNhlSeason(
      new URL(request.url).searchParams.get('season'),
    );
    const date = season.standingsDate ?? todayIso();
    const cacheKey = generateCacheKey('nhl-standings', { season: season.key });

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<StandingsData> => {
        const response = await fetch(nhlStandingsUrl(date));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NhlStandingsResponse = await response.json();

        // Keep only rows for the requested season. A not-yet-started season
        // returns an empty array (or rows for a different season), so this
        // yields an empty table that the page surfaces as "not started".
        const rows = (data.standings || []).filter(
          (row) => String(row.seasonId) === season.seasonId,
        );

        const stats: TeamStats[] = rows.map((row) => ({
          Rank: row.leagueSequence,
          Team: 0,
          GP: row.gamesPlayed,
          W: row.wins,
          T: row.ties,
          L: row.losses,
          G: row.goalFor,
          GPG: perGame(row.goalFor, row.gamesPlayed),
          GA: row.goalAgainst,
          GAPG: perGame(row.goalAgainst, row.gamesPlayed),
          OTL: row.otLosses,
          SOW: 0,
          SOL: 0,
          Points: row.points,
          conference: row.conferenceName,
          division: row.divisionName,
          info: {
            code: row.teamAbbrev.default,
            externalId: row.teamAbbrev.default,
            short: row.teamCommonName.default,
            long: row.teamName.default,
            full: row.teamName.default,
            logo: row.teamLogo,
          },
        }));

        return { dataColumns: [], stats };
      },
    );

    return NextResponse.json(domainData);
  } catch (error) {
    console.error('Error fetching NHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL standings' },
      { status: 500 },
    );
  }
}
