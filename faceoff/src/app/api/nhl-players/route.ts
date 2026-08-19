import { NextResponse } from 'next/server';
import { nhlSkaterStatsUrl, resolveNhlSeason } from '../../config/nhl';
import { getRosterIndex } from '../../services/nhlService';
import type {
  DataColumn,
  PlayerStatsData,
} from '../../types/domain/player-stats';
import type { NhlSkaterSummary, NhlStatsResponse } from '../../types/nhl/stats';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { countryCodeToAlpha2 } from '../../utils/countryCode';
import { translateNhlSkaterStatsToDomain } from '../../utils/translators/nhlToDomain';

const DATA_COLUMNS: DataColumn[] = [
  { name: 'Rank', type: 'number', highlighted: true, group: 'position' },
  { name: 'Player', type: 'string', highlighted: true, group: 'player' },
  { name: 'Team', type: 'string', highlighted: true, group: 'team' },
  { name: 'GP', type: 'number', highlighted: false, group: 'games' },
  { name: 'TP', type: 'number', highlighted: true, group: 'points' },
  { name: 'G', type: 'number', highlighted: false, group: 'points' },
  { name: 'A', type: 'number', highlighted: false, group: 'points' },
];

// Enough to cover the full league (~940 skaters) so team and nationality
// filtering is reliable — a club's or a country's best scorer may sit well
// outside the league top 50.
const FULL_LIMIT = 1000;
// The league page only needs the top scorers.
const TOP_LIMIT = 50;

/** True when `teamAbbrevs` (e.g. "EDM" or "EDM,LAK") includes `code`. */
function playsFor(teamAbbrevs: string, code: string): boolean {
  return teamAbbrevs
    .split(',')
    .some((a) => a.trim().toLowerCase() === code.toLowerCase());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamCode = searchParams.get('teamCode');
    const nationality = searchParams.get('nationality');
    const season = resolveNhlSeason(searchParams.get('season'));

    // Both filters need the whole leaderboard; the league page only needs the
    // top slice. Ranks are always league-wide, so a filtered row keeps the
    // position it holds in the league, not in the filtered subset.
    const wantsFull = Boolean(teamCode || nationality);
    const limit = wantsFull ? FULL_LIMIT : TOP_LIMIT;
    const cacheKey = generateCacheKey(
      wantsFull ? 'nhl-players-full' : 'nhl-players-points',
      { season: season.key },
    );

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<PlayerStatsData> => {
        const [response, rosters] = await Promise.all([
          fetch(nhlSkaterStatsUrl(season.seasonId, limit)),
          // Nationality, jersey number and birth data live only on the roster
          // feed; an empty index just leaves those fields stubbed.
          getRosterIndex(season.seasonId),
        ]);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NhlStatsResponse<NhlSkaterSummary> = await response.json();
        const stats = (data.data || []).map((row, index) =>
          translateNhlSkaterStatsToDomain(
            row,
            index + 1,
            rosters.get(String(row.playerId)),
          ),
        );

        return {
          dataColumns: DATA_COLUMNS,
          defaultSortKey: { name: 'TP', order: 'desc' },
          stats,
        };
      },
    );

    // Compare on alpha-2 so "SE" and "SWE" both work.
    const wantedCountry = nationality ? countryCodeToAlpha2(nationality) : null;
    const stats = domainData.stats.filter(
      (p) =>
        (!teamCode || playsFor(p.info.team.code, teamCode)) &&
        (!wantedCountry || p.info.nationality === wantedCountry),
    );

    const result: PlayerStatsData =
      teamCode || wantedCountry ? { ...domainData, stats } : domainData;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching NHL players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL players' },
      { status: 500 },
    );
  }
}
