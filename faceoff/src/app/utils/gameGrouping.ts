import type { GameInfo } from '../types/domain/game';
import { formatTimeFromString } from './dateUtils';

export type GameTimeGroup = { time: string; games: GameInfo[] };

/**
 * Bucket a day's games by start time (HH:MM), earliest first — the grouping
 * used by the game list on every league landing page.
 */
export function groupGamesByTime(games: GameInfo[]): GameTimeGroup[] {
  const grouped = games.reduce(
    (acc, game) => {
      const time = formatTimeFromString(game.startDateTime);
      if (!acc[time]) acc[time] = [];
      acc[time].push(game);
      return acc;
    },
    {} as Record<string, GameInfo[]>,
  );

  return Object.keys(grouped)
    .sort((a, b) => minutes(a) - minutes(b))
    .map((time) => ({ time, games: grouped[time] }));
}

/** Minutes since midnight for an "HH:MM" label. */
function minutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}
