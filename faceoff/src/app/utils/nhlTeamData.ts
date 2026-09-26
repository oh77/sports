import type { GameInfo, LeagueResponse } from '../types/domain/game';
import type { StandingsData } from '../types/domain/standings';
import { withSeason } from './leaguePaths';

/*
 * Client-side loaders for the NHL team and matchup pages. NHL schedules are
 * fetched per club, so a page about two clubs loads both and merges them.
 */

/** A club's full season schedule. */
export async function fetchNhlTeamGames(
  teamCode: string,
  season: string,
): Promise<GameInfo[]> {
  const response = await fetch(
    withSeason(
      `/api/nhl-games?type=team&teamCode=${encodeURIComponent(teamCode)}`,
      season,
    ),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status}`);
  }
  const data: LeagueResponse = await response.json();
  return data.gameInfo || [];
}

/** NHL standings, or null when they can't be loaded — they're optional. */
export async function fetchNhlStandings(
  season: string,
): Promise<StandingsData | null> {
  try {
    const response = await fetch(withSeason('/api/nhl-standings', season));
    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error('Failed to load standings:', err);
    return null;
  }
}

/** Both clubs' schedules as one list, their meetings included once. */
export async function fetchNhlMatchupGames(
  teamCode: string,
  opponentCode: string,
  season: string,
): Promise<GameInfo[]> {
  const [own, opponent] = await Promise.all([
    fetchNhlTeamGames(teamCode, season),
    fetchNhlTeamGames(opponentCode, season),
  ]);
  const seen = new Set(own.map((game) => game.uuid));
  return [...own, ...opponent.filter((game) => !seen.has(game.uuid))];
}
