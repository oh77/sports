import type { GameInfo } from '../types/domain/game';

/**
 * One finished game seen from a single team. OT/shootout results are shaded.
 * `draw` is a real result: a CHL playoff leg is played to its end and settled
 * on aggregate, so a level leg is neither a win nor a loss.
 */
export type FormResult = 'win' | 'win-ot' | 'loss' | 'loss-ot' | 'draw';

export interface TeamFormEntry {
  uuid: string;
  result: FormResult;
  /** Opponent's short name, for the marker's tooltip. */
  opponent: string;
  location: 'H' | 'B';
  teamScore: number;
  opponentScore: number;
  startDateTime: string;
}

export interface TeamFormIndex {
  /**
   * A team's most recent finished games, oldest first. `before` (an ISO start
   * time) limits it to games that started earlier — what a listed game needs,
   * so a finished game is never counted as form leading up to itself.
   */
  formFor(teamCode: string, limit: number, before?: string): TeamFormEntry[];
}

/** One side of a finished game as a form entry. */
function entryFor(game: GameInfo, isHome: boolean): TeamFormEntry {
  const teamScore = isHome ? game.homeTeamInfo.score : game.awayTeamInfo.score;
  const opponentScore = isHome
    ? game.awayTeamInfo.score
    : game.homeTeamInfo.score;
  const opponent = isHome
    ? game.awayTeamInfo.teamInfo.short
    : game.homeTeamInfo.teamInfo.short;

  const afterRegulation = Boolean(game.overtime || game.shootout);

  let result: FormResult;
  if (teamScore > opponentScore) {
    result = afterRegulation ? 'win-ot' : 'win';
  } else if (teamScore < opponentScore) {
    result = afterRegulation ? 'loss-ot' : 'loss';
  } else {
    result = 'draw';
  }

  return {
    uuid: game.uuid,
    result,
    opponent,
    location: isHome ? 'H' : 'B',
    teamScore,
    opponentScore,
    startDateTime: game.startDateTime,
  };
}

/**
 * Index a set of games by team, so a listing can show each side's recent form
 * without re-scanning the whole list per row. Built once per game set (memoise
 * it in the page) and queried per team.
 */
export function buildTeamFormIndex(games: GameInfo[]): TeamFormIndex {
  const byTeam = new Map<string, TeamFormEntry[]>();

  const finished = games
    .filter((game) => game.state === 'finished')
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  for (const game of finished) {
    for (const isHome of [true, false]) {
      const code = isHome
        ? game.homeTeamInfo.teamInfo.code
        : game.awayTeamInfo.teamInfo.code;
      if (!code) continue;
      const entries = byTeam.get(code) ?? [];
      entries.push(entryFor(game, isHome));
      byTeam.set(code, entries);
    }
  }

  return {
    formFor(teamCode, limit, before) {
      const entries = byTeam.get(teamCode) ?? [];
      if (!before) return entries.slice(-limit);
      const cutoff = new Date(before).getTime();
      return entries
        .filter((entry) => new Date(entry.startDateTime).getTime() < cutoff)
        .slice(-limit);
    },
  };
}
