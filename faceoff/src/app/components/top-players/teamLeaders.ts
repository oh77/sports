import type {
  GoalieStats,
  GoalieStatsData,
} from '@/app/types/domain/goalie-stats';
import type {
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import { withSeason } from '@/app/utils/leaguePaths';

/** Scorers listed on a team's own page. */
export const SCORERS_PER_TEAM = 3;

/** Goalies listed on a team's own page. */
export const GOALIES_PER_TEAM = 2;

/**
 * A team's top scorers by points. Stats may be unavailable (e.g. early in a
 * new season), so a failure warns and yields an empty list — the section just
 * collapses. console.warn, not error, so it doesn't trip the dev overlay.
 */
export async function fetchTeamScorers(
  league: string,
  season: string | undefined,
  teamCode: string,
  count: number,
): Promise<PlayerStats[]> {
  try {
    const data: PlayerStatsData = await fetchJson(
      withSeason(
        `/api/${league}-players?teamCode=${encodeURIComponent(teamCode)}`,
        season,
      ),
    );
    return [...data.stats].sort((a, b) => b.TP - a.TP).slice(0, count);
  } catch (err) {
    console.warn(`Error fetching top scorers for ${teamCode}:`, err);
    return [];
  }
}

/** A team's top goalies; see {@link pickGoalies}. Failures yield []. */
export async function fetchTeamGoalies(
  league: string,
  season: string | undefined,
  teamCode: string,
  count: number,
): Promise<GoalieStats[]> {
  try {
    const data: GoalieStatsData = await fetchJson(
      withSeason(
        `/api/${league}-goalies?teamCode=${encodeURIComponent(teamCode)}`,
        season,
      ),
    );
    return pickGoalies(data.stats ?? [], count);
  } catch (err) {
    console.warn(`Error fetching top goalies for ${teamCode}:`, err);
    return [];
  }
}

/**
 * The team's most-used goalies, best save percentage first. Picking by games
 * played keeps a third-stringer with one clean game from pushing the starter
 * out.
 */
function pickGoalies(goalies: GoalieStats[], count: number): GoalieStats[] {
  return [...goalies]
    .sort((a, b) => b.GP - a.GP)
    .slice(0, count)
    .sort((a, b) => Number(b.SVSPerc) - Number(a.SVSPerc));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}
