import { FAVORITES, type FavoriteTeam } from '@/app/config/favorites';
import { isLeague } from '@/app/config/leagues';
import type { Game } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';

/** The (league, code) pairs a favorite is followed under. */
export function favoriteEntries(
  team: FavoriteTeam,
): { league: League; code: string }[] {
  return Object.entries(team.codes).flatMap(([league, code]) =>
    isLeague(league) && code ? [{ league, code }] : [],
  );
}

const favoriteKeys = new Set(
  FAVORITES.flatMap(favoriteEntries).map(({ league, code }) =>
    key(league, code),
  ),
);

export function isFavoriteTeam(league: League, code: string): boolean {
  return favoriteKeys.has(key(league, code));
}

/** Which side(s) of a game are favorite teams. */
export function favoriteSides(game: Game): { home: boolean; away: boolean } {
  return {
    home: isFavoriteTeam(game.league, game.home.code),
    away: isFavoriteTeam(game.league, game.away.code),
  };
}

export function isFavoriteGame(game: Game): boolean {
  const { home, away } = favoriteSides(game);
  return home || away;
}

function key(league: League, code: string): string {
  return `${league}:${code.toLowerCase()}`;
}
