import type { GameInfo } from '../types/domain/game';
import type { TeamInfo } from '../types/domain/team';

/** A team's running totals after one of its games. */
export interface TeamTally {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface PositionHistory {
  /** Every team in the schedule, in current table order. */
  teams: TeamInfo[];
  /** Games played by the team that has played the most — the x-axis length. */
  rounds: number;
  /**
   * `positions[code][k - 1]` — the team's table position (1 = top) once every
   * team has played k games, or as many as it had by then.
   */
  positions: Record<string, number[]>;
  /** `tallies[code][k - 1]` — the totals behind that position. */
  tallies: Record<string, TeamTally[]>;
  /** Games each team has actually played. */
  played: Record<string, number>;
}

const EMPTY: TeamTally = { points: 0, goalsFor: 0, goalsAgainst: 0 };

/**
 * Swedish league points: 3 for a win in regulation, 2 after overtime or
 * shootout, 1 for an overtime/shootout loss, 0 for a regulation loss.
 */
function pointsFor(own: number, other: number, extra: boolean): number {
  if (own > other) return extra ? 2 : 3;
  return extra ? 1 : 0;
}

/**
 * The table after each round of games, rebuilt from the finished results.
 * Round k ranks every team on its totals after its k-th game; a team that has
 * played fewer games by then (a postponement) keeps its latest totals, as it
 * would in the real table. Ties go by goal difference, then goals scored.
 */
export function buildPositionHistory(games: GameInfo[]): PositionHistory {
  const teamsByCode = new Map<string, TeamInfo>();
  const tallies: Record<string, TeamTally[]> = {};

  for (const game of games) {
    for (const side of [game.homeTeamInfo, game.awayTeamInfo]) {
      const code = side.teamInfo.code;
      if (!code || teamsByCode.has(code)) continue;
      teamsByCode.set(code, side.teamInfo);
      tallies[code] = [];
    }
  }

  const finished = games
    .filter(
      (game) =>
        game.state === 'finished' &&
        typeof game.homeTeamInfo.score === 'number' &&
        typeof game.awayTeamInfo.score === 'number',
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  for (const game of finished) {
    const home = game.homeTeamInfo;
    const away = game.awayTeamInfo;
    const extra = Boolean(game.overtime || game.shootout);
    for (const [own, other] of [
      [home, away],
      [away, home],
    ]) {
      const list = tallies[own.teamInfo.code];
      if (!list) continue;
      const last = list[list.length - 1] ?? EMPTY;
      list.push({
        points: last.points + pointsFor(own.score, other.score, extra),
        goalsFor: last.goalsFor + own.score,
        goalsAgainst: last.goalsAgainst + other.score,
      });
    }
  }

  const codes = [...teamsByCode.keys()];
  const played = Object.fromEntries(
    codes.map((code) => [code, tallies[code].length]),
  );
  const rounds = Math.max(0, ...Object.values(played));

  const tallyAt = (code: string, round: number): TeamTally => {
    const list = tallies[code];
    return list[Math.min(round, list.length) - 1] ?? EMPTY;
  };

  const positions: Record<string, number[]> = Object.fromEntries(
    codes.map((code) => [code, []]),
  );
  const roundTallies: Record<string, TeamTally[]> = Object.fromEntries(
    codes.map((code) => [code, []]),
  );

  let order = codes;
  for (let round = 1; round <= rounds; round++) {
    order = [...codes].sort((a, b) => {
      const x = tallyAt(a, round);
      const y = tallyAt(b, round);
      return (
        y.points - x.points ||
        y.goalsFor - y.goalsAgainst - (x.goalsFor - x.goalsAgainst) ||
        y.goalsFor - x.goalsFor ||
        (teamsByCode.get(a)?.short ?? a).localeCompare(
          teamsByCode.get(b)?.short ?? b,
          'sv',
        )
      );
    });
    order.forEach((code, index) => {
      positions[code].push(index + 1);
      roundTallies[code].push(tallyAt(code, round));
    });
  }

  return {
    teams: order.map((code) => teamsByCode.get(code) as TeamInfo),
    rounds,
    positions,
    tallies: roundTallies,
    played,
  };
}
