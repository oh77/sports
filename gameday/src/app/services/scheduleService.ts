import { LEAGUES } from '@/app/config/leagues';
import { SPORTS, upstreamBaseUrl } from '@/app/config/upstreams';
import type { Game } from '@/app/types/domain/game';
import type { League, Sport } from '@/app/types/domain/league';
import type { GamesWindowResponse } from '@/app/types/upstream/games-window';
import { gamesWindowToDomain } from '@/app/utils/translators/upstreamToDomain';

/** faceoff's NHL/CHL sweep can be slow on a cold cache. */
const TIMEOUT_MS = 20_000;

export type Schedule = {
  /** All games in the window across sports, chronological. */
  games: Game[];
  /** Sports whose upstream app could not be reached. */
  failed: Sport[];
};

/**
 * Games on Swedish calendar days `from`..`to` (YYYY-MM-DD, inclusive) from
 * kickoff and faceoff. Upstreams cache their provider data, so this fetches
 * fresh on every call.
 */
export async function getSchedule(from: string, to: string): Promise<Schedule> {
  const results = await Promise.all(
    SPORTS.map(async (sport) => {
      try {
        return { sport, games: await fetchWindow(sport, from, to) };
      } catch (error) {
        console.error(`Failed to fetch ${sport} schedule:`, error);
        return { sport, games: null };
      }
    }),
  );

  return {
    games: results
      .flatMap((r) => r.games ?? [])
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)),
    failed: results.filter((r) => r.games === null).map((r) => r.sport),
  };
}

/**
 * One league's games on `from`..`to`, chronological. Throws when the league's
 * upstream app (or its provider) is unavailable.
 */
export async function getLeagueGames(
  league: League,
  from: string,
  to: string,
): Promise<Game[]> {
  const games = await fetchWindow(LEAGUES[league].sport, from, to, league);
  // An upstream that predates the `league` filter answers with every league.
  return games.filter((game) => game.league === league);
}

async function fetchWindow(
  sport: Sport,
  from: string,
  to: string,
  league?: League,
): Promise<Game[]> {
  const baseUrl = upstreamBaseUrl(sport);
  let url = `${baseUrl}/api/games-window?from=${from}&to=${to}`;
  if (league) url += `&league=${league}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = (await response.text().catch(() => '')).trim().slice(0, 200);
    throw new Error(
      `${url} responded ${response.status}${body ? `: ${body}` : ''}`,
    );
  }
  const data: GamesWindowResponse = await response.json();
  return gamesWindowToDomain(sport, baseUrl, data);
}
