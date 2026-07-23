import { NextResponse } from 'next/server';
import { nhlGoalieStatsUrl, resolveNhlSeason } from '../../config/nhl';
import type { GoalieStatsData } from '../../types/domain/goalie-stats';
import type { DataColumn } from '../../types/domain/player-stats';
import type { NhlGoalieSummary, NhlStatsResponse } from '../../types/nhl/stats';
import { generateCacheKey, getCachedData } from '../../utils/cache';
import { translateNhlGoalieStatsToDomain } from '../../utils/translators/nhlToDomain';

const DATA_COLUMNS: DataColumn[] = [
  { name: 'Rank', type: 'number', highlighted: true, group: 'position' },
  { name: 'Player', type: 'string', highlighted: true, group: 'player' },
  { name: 'Team', type: 'string', highlighted: true, group: 'team' },
  { name: 'GP', type: 'number', highlighted: false, group: 'games' },
  { name: 'SVS', type: 'number', highlighted: false, group: 'saves' },
  { name: 'GA', type: 'number', highlighted: false, group: 'saves' },
  { name: 'SVSPerc', type: 'string', highlighted: true, group: 'saves' },
  { name: 'GAA', type: 'string', highlighted: true, group: 'saves' },
  { name: 'SO', type: 'number', highlighted: false, group: 'saves' },
];

// Enough to cover the full league so team filtering is reliable.
const FULL_LIMIT = 1000;
// The league page only needs the top goalies.
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

    // Team filtering needs the whole leaderboard; the league page only the top.
    const limit = teamCode ? FULL_LIMIT : TOP_LIMIT;
    const cacheKey = generateCacheKey(
      teamCode ? 'nhl-goalies-full' : 'nhl-goalies-summary',
      { season: season.key },
    );

    const domainData = await getCachedData(
      cacheKey,
      async (): Promise<GoalieStatsData> => {
        const response = await fetch(nhlGoalieStatsUrl(season.seasonId, limit));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NhlStatsResponse<NhlGoalieSummary> = await response.json();
        const stats = (data.data || []).map((row, index) =>
          translateNhlGoalieStatsToDomain(row, index + 1),
        );

        return {
          dataColumns: DATA_COLUMNS,
          defaultSortKey: { name: 'SVSPerc', order: 'desc' },
          stats,
        };
      },
    );

    const result: GoalieStatsData = teamCode
      ? {
          ...domainData,
          stats: domainData.stats.filter((g) =>
            playsFor(g.info.team.code, teamCode),
          ),
        }
      : domainData;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching NHL goalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NHL goalies' },
      { status: 500 },
    );
  }
}
