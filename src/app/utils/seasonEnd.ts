import type { GameInfo } from '../types/domain/game';
import type { TeamInfo } from '../types/domain/team';

export type GameDayGroup = { date: string; games: GameInfo[] };

/** The most recent finished game (by start time), or null if none are finished. */
export function getLastFinishedGame(games: GameInfo[]): GameInfo | null {
  const finished = games
    .filter((game) => game.state === 'finished')
    .sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime(),
    );
  return finished[0] ?? null;
}

/** The winning team of a finished game, or null on a tie. */
export function getGameWinner(game: GameInfo): TeamInfo | null {
  const { homeTeamInfo, awayTeamInfo } = game;
  if (homeTeamInfo.score === awayTeamInfo.score) return null;
  return homeTeamInfo.score > awayTeamInfo.score
    ? homeTeamInfo.teamInfo
    : awayTeamInfo.teamInfo;
}

/**
 * Group finished games into day buckets, most recent first.
 * `before` excludes games on/after a reference date; `limit` caps the day count.
 */
export function buildPreviousGameDays(
  games: GameInfo[],
  { before, limit = 2 }: { before?: Date; limit?: number } = {},
): GameDayGroup[] {
  const finished = games.filter((game) => game.state === 'finished');

  const dates = new Set<string>();
  finished.forEach((game) => {
    const date = new Date(game.startDateTime);
    if (!before || date < before) {
      dates.add(date.toDateString());
    }
  });

  return Array.from(dates)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime())
    .slice(0, limit)
    .map((date) => {
      const dateString = date.toDateString();
      return {
        date: date.toLocaleDateString('sv-SE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        games: finished.filter(
          (game) => new Date(game.startDateTime).toDateString() === dateString,
        ),
      };
    });
}
