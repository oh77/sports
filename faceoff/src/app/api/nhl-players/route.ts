import { NextResponse } from 'next/server';
import { nhlSkaterStatsUrl, resolveNhlSeason } from '../../config/nhl';
import type {
  DataColumn,
  PlayerStatsData,
} from '../../types/domain/player-stats';
import type { NhlSkaterSummary, NhlStatsResponse } from '../../types/nhl/stats';
import { generateCacheKey, getCachedData } from '../../utils/cache';
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

// Enough to cover the full league (~940 skaters) so team filtering is reliable.
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
    const season = resolveNhlSeason(searchParams.get('season'));

    // Team filtering needs the whole leaderboard (a club's best scorer may sit
    // outside the league top 50); the league page only needs the top slice.
    const limit = teamCode ? FULL_LIMIT : TOP_LIMIT;
    const cacheKey = generateCacheKey(
      teamCode ? 'nhl-players-full' : 'nhl-players-points',
      { season: season.key },
    );

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<PlayerStatsData> => {
        const response = await fetch(nhlSkaterStatsUrl(season.seasonId, limit));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NhlStatsResponse<NhlSkaterSummary> = await response.json();
        const stats = (data.data || []).map((row, index) =>
          translateNhlSkaterStatsToDomain(row, index + 1),
        );

        return {
          dataColumns: DATA_COLUMNS,
          defaultSortKey: { name: 'TP', order: 'desc' },
          stats,
        };
      },
    );

    const result: PlayerStatsData = teamCode
      ? {
          ...domainData,
          stats: domainData.stats.filter((p) =>
            playsFor(p.info.team.code, teamCode),
          ),
        }
      : domainData;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching NHL players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL players' },
      { status: 500 },
    );
  }
}
