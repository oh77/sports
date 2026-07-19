import type { GameInfo } from '../types/domain/game';
import type { TeamInfo } from '../types/domain/team';

export type GameDayGroup = { date: string; games: GameInfo[] };

/** Long Swedish date label, e.g. "måndag 13 september 2025". */
function formatGameDayLabel(date: Date): string {
  return date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Start-of-day timestamp for a date. */
function startOfDay(date: Date): number {
  return new Date(date.toDateString()).getTime();
}

/**
 * Build the upcoming game days to show on a landing page. Starts at today (if it
 * has games) or the next future date, then keeps adding whole dates — never
 * splitting a date — until at least `minGames` games are included. Returns []
 * when there are no current or upcoming games.
 */
export function buildUpcomingGameDays(
  games: GameInfo[],
  { minGames = 3 }: { minGames?: number } = {},
): GameDayGroup[] {
  const now = new Date();
  const todayStr = now.toDateString();
  const hasGamesToday = games.some(
    (game) => new Date(game.startDateTime).toDateString() === todayStr,
  );

  let startMs: number;
  if (hasGamesToday) {
    startMs = startOfDay(now);
  } else {
    const nextFuture = games
      .filter((game) => new Date(game.startDateTime) >= now)
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      )[0];
    if (!nextFuture) return [];
    startMs = startOfDay(new Date(nextFuture.startDateTime));
  }

  // Bucket games by date (insertion order = chronological) from the start day on.
  const byDate = new Map<string, GameInfo[]>();
  games
    .filter((game) => startOfDay(new Date(game.startDateTime)) >= startMs)
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )
    .forEach((game) => {
      const dateString = new Date(game.startDateTime).toDateString();
      const bucket = byDate.get(dateString);
      if (bucket) {
        bucket.push(game);
      } else {
        byDate.set(dateString, [game]);
      }
    });

  // Take whole days until we have at least `minGames` games.
  const result: GameDayGroup[] = [];
  let total = 0;
  for (const [dateString, dayGames] of byDate) {
    if (total >= minGames) break;
    result.push({
      date: formatGameDayLabel(new Date(dateString)),
      games: dayGames,
    });
    total += dayGames.length;
  }
  return result;
}

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
        date: formatGameDayLabel(date),
        games: finished.filter(
          (game) => new Date(game.startDateTime).toDateString() === dateString,
        ),
      };
    });
}
