import type { GoalieStats } from '@/app/types/domain/goalie-stats';

/** A club's goalie tandem: its two most-used goalies, with their stats pooled. */
export interface GoaliePair {
  /** Team code the pair is grouped under, used as the list key. */
  teamKey: string;
  teamName: string;
  /** One or two goalies, most games played first. */
  goalies: GoalieStats[];
  /** Games played, saves and goals against summed across the pair. */
  GP: number;
  SVS: number;
  GA: number;
  /** Pooled save percentage, 0-100. */
  savePercentage: number;
  /** Pooled goals-against average, per 60 minutes. */
  goalsAgainstAverage: number;
}

/**
 * NHL rows carry every club a traded player has appeared for ("EDM,LAK"); the
 * last one is the current club, which is the pair he belongs to today. Statnet
 * and CHL rows carry a single code, so they pass through unchanged.
 */
function currentTeam(value: string): string {
  const last = value.split(',').pop()?.trim();
  return last || value;
}

/**
 * Ice time behind a goalie's numbers, in minutes.
 *
 * The feeds carry no time on ice, but GAA is goals against per 60 minutes, so
 * it inverts back to the minutes played. A goalie who has yet to concede (or
 * whose GAA is missing) leaves nothing to invert, so his games are counted as
 * full ones instead.
 */
function estimatedMinutes(goalie: GoalieStats): number {
  const gaa = Number(goalie.GAA);
  if (goalie.GA > 0 && Number.isFinite(gaa) && gaa > 0) {
    return (goalie.GA / gaa) * 60;
  }
  return goalie.GP * 60;
}

/**
 * Group goalies into per-club tandems, ranked by pooled save percentage.
 *
 * Only goalies with at least one game played count, and only a club's two
 * busiest goalies make up its pair — a third-stringer's handful of games would
 * otherwise swing the pooled numbers. Clubs that have used a single goalie are
 * still listed, with that goalie alone.
 *
 * The pooled save percentage is computed from saves and goals against, and the
 * pooled GAA from goals against over the pair's combined ice time, rather than
 * by averaging the two individual figures — so each goalie counts in
 * proportion to the shots he faced and the minutes he played.
 */
export function buildGoaliePairs(goalies: GoalieStats[]): GoaliePair[] {
  const byTeam = new Map<string, GoalieStats[]>();
  for (const goalie of goalies) {
    if (goalie.GP < 1) continue;
    const key = currentTeam(goalie.info.team.code);
    const existing = byTeam.get(key);
    if (existing) {
      existing.push(goalie);
    } else {
      byTeam.set(key, [goalie]);
    }
  }

  const pairs: GoaliePair[] = [];
  for (const [teamKey, teamGoalies] of byTeam) {
    const pair = [...teamGoalies]
      .sort((a, b) => b.GP - a.GP || b.SVS - a.SVS)
      .slice(0, 2);
    const GP = pair.reduce((sum, g) => sum + g.GP, 0);
    const SVS = pair.reduce((sum, g) => sum + g.SVS, 0);
    const GA = pair.reduce((sum, g) => sum + g.GA, 0);
    const shots = SVS + GA;
    // A pair that has somehow faced no shots has no percentage to rank.
    if (shots === 0) continue;
    const minutes = pair.reduce((sum, g) => sum + estimatedMinutes(g), 0);

    pairs.push({
      teamKey,
      teamName: currentTeam(pair[0].info.team.name),
      goalies: pair,
      GP,
      SVS,
      GA,
      savePercentage: (SVS / shots) * 100,
      goalsAgainstAverage: minutes > 0 ? (GA / minutes) * 60 : 0,
    });
  }

  return pairs.sort(
    (a, b) => b.savePercentage - a.savePercentage || b.GP - a.GP,
  );
}
