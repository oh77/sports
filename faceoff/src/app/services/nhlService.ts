import { nhlClubScheduleUrl, nhlScheduleUrl } from '../config/nhl';
import type {
  NHLGame,
  NHLGameStatus,
  NHLGameTeam,
  NhlClubScheduleResponse,
  NhlScheduleGame,
  NhlScheduleResponse,
  NhlScheduleTeam,
} from '../types/nhl/game';

/**
 * How many week-windows the service will walk in either direction from the
 * anchor date. Each schedule request covers roughly one week, so this bounds
 * both the look-ahead/look-back window and the number of upstream requests.
 */
const MAX_WEEKS = 3;

/** Number of games returned by the "next / last N" helpers. */
const SHORT_LIMIT = 3;

async function fetchSchedule(date: string): Promise<NhlScheduleResponse> {
  try {
    const response = await fetch(nhlScheduleUrl(date));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching NHL schedule:', error);
    throw error;
  }
}

/** Today's date as a YYYY-MM-DD anchor for the schedule endpoint. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolve the date to anchor the schedule walk on. Normally today, but in the
 * off-season (today's week has no games) we jump to the upcoming regular-season
 * start so the app surfaces the opening game days instead of nothing.
 */
async function effectiveAnchor(): Promise<string> {
  const today = todayIso();
  try {
    const probe = await fetchSchedule(today);
    if (flattenWeek(probe).length > 0) return today;
    const start = probe.regularSeasonStartDate;
    if (start && start > today) return start;
  } catch {
    // Fall back to today on any error.
  }
  return today;
}

/** Flatten a schedule response's game week into a flat list of games. */
function flattenWeek(response: NhlScheduleResponse): NhlScheduleGame[] {
  return response.gameWeek.flatMap((day) => day.games);
}

function byStartAsc(a: NhlScheduleGame, b: NhlScheduleGame): number {
  return (
    new Date(a.startTimeUTC).getTime() - new Date(b.startTimeUTC).getTime()
  );
}

function normalizeState(state: NhlScheduleGame['gameState']): NHLGameStatus {
  switch (state) {
    case 'OFF':
    case 'FINAL':
      return 'finished';
    case 'LIVE':
    case 'CRIT':
      return 'live';
    default:
      return 'not-started';
  }
}

function transformTeam(team: NhlScheduleTeam): NHLGameTeam {
  return {
    id: team.id,
    abbrev: team.abbrev,
    commonName: team.commonName?.default ?? team.abbrev,
    placeName: team.placeName?.default ?? '',
    logo: team.logo,
  };
}

function transformGame(game: NhlScheduleGame): NHLGame {
  const hasScore =
    typeof game.homeTeam.score === 'number' &&
    typeof game.awayTeam.score === 'number';

  return {
    id: String(game.id),
    startDate: game.startTimeUTC,
    status: normalizeState(game.gameState),
    venue: game.venue?.default ?? 'n/a',
    homeTeam: transformTeam(game.homeTeam),
    awayTeam: transformTeam(game.awayTeam),
    scores: hasScore
      ? {
          home: game.homeTeam.score as number,
          away: game.awayTeam.score as number,
        }
      : undefined,
    overtime: game.gameOutcome?.lastPeriodType === 'OT',
    shootout: game.gameOutcome?.lastPeriodType === 'SO',
    gameType: game.gameType,
  };
}

/**
 * Walk the schedule from `anchor`, collecting de-duplicated games. Stops after
 * `MAX_WEEKS` hops, or early once `stop` reports enough games have been seen.
 */
async function walk(
  anchor: string,
  direction: 'next' | 'previous',
  stop?: (games: NhlScheduleGame[]) => boolean,
): Promise<NhlScheduleGame[]> {
  const seen = new Set<string>();
  const collected: NhlScheduleGame[] = [];
  let cursor: string | null = anchor;

  for (let hop = 0; hop < MAX_WEEKS && cursor; hop++) {
    const response = await fetchSchedule(cursor);
    for (const game of flattenWeek(response)) {
      const id = String(game.id);
      if (!seen.has(id)) {
        seen.add(id);
        collected.push(game);
      }
    }
    if (stop?.(collected)) break;
    cursor =
      direction === 'next'
        ? (response.nextStartDate ?? null)
        : (response.previousStartDate ?? null);
  }

  return collected;
}

async function collectUpcoming(limit: number): Promise<NHLGame[]> {
  try {
    const now = new Date();
    const isUpcoming = (g: NhlScheduleGame) => new Date(g.startTimeUTC) > now;

    const games = await walk(await effectiveAnchor(), 'next', (collected) =>
      Number.isFinite(limit)
        ? collected.filter(isUpcoming).length >= limit
        : false,
    );

    const upcoming = games.filter(isUpcoming).sort(byStartAsc);
    const sliced = Number.isFinite(limit) ? upcoming.slice(0, limit) : upcoming;
    return sliced.map(transformGame);
  } catch (error) {
    console.error('Error getting upcoming NHL games:', error);
    return [];
  }
}

async function collectRecent(limit: number): Promise<NHLGame[]> {
  try {
    const isFinished = (g: NhlScheduleGame) =>
      normalizeState(g.gameState) === 'finished';

    const games = await walk(todayIso(), 'previous', (collected) =>
      Number.isFinite(limit)
        ? collected.filter(isFinished).length >= limit
        : false,
    );

    // Most recent first.
    const recent = games.filter(isFinished).sort((a, b) => byStartAsc(b, a));
    const sliced = Number.isFinite(limit) ? recent.slice(0, limit) : recent;
    return sliced.map(transformGame);
  } catch (error) {
    console.error('Error getting recent NHL games:', error);
    return [];
  }
}

/** The next few upcoming games (scheduled, future start). */
export async function getUpcomingGames(): Promise<NHLGame[]> {
  return collectUpcoming(SHORT_LIMIT);
}

/** The last few finished games. */
export async function getRecentGames(): Promise<NHLGame[]> {
  return collectRecent(SHORT_LIMIT);
}

/** All upcoming games within the look-ahead window. */
export async function getAllUpcomingGames(): Promise<NHLGame[]> {
  return collectUpcoming(Number.POSITIVE_INFINITY);
}

/** All finished games within the look-back window. */
export async function getAllRecentGames(): Promise<NHLGame[]> {
  return collectRecent(Number.POSITIVE_INFINITY);
}

/**
 * Every game in the schedule window, sorted chronologically. Used by the league
 * page to build game days.
 *
 * - With no `anchor` (the ongoing season): walks both back and forward around
 *   today (re-anchoring to the season opener in the off-season).
 * - With an `anchor` (a past season's start date): walks forward only, so the
 *   window covers that season from its opening.
 */
export async function getAllGames(anchor?: string): Promise<NHLGame[]> {
  try {
    if (anchor) {
      const games = await walk(anchor, 'next');
      return dedupeById(games).sort(byStartAsc).map(transformGame);
    }

    const eff = await effectiveAnchor();
    const [past, future] = await Promise.all([
      walk(eff, 'previous'),
      walk(eff, 'next'),
    ]);

    return dedupeById([...past, ...future])
      .sort(byStartAsc)
      .map(transformGame);
  } catch (error) {
    console.error('Error getting all NHL games:', error);
    return [];
  }
}

/**
 * Games in the window ending at `anchor` (a season's playoff end), walking
 * backward. Wide enough to cover a best-of-7 final; the caller isolates the
 * final series and champion from the finished games.
 */
export async function getFinalsGames(anchor: string): Promise<NHLGame[]> {
  try {
    const games = await walk(anchor, 'previous');
    return dedupeById(games).sort(byStartAsc).map(transformGame);
  } catch (error) {
    console.error('Error getting NHL finals games:', error);
    return [];
  }
}

/**
 * A club's entire season, sorted chronologically, from the dedicated
 * club-schedule-season endpoint (a single request — no weekly walk).
 */
export async function getTeamSeasonGames(
  teamCode: string,
  seasonId: string,
): Promise<NHLGame[]> {
  try {
    const response = await fetch(nhlClubScheduleUrl(teamCode, seasonId));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: NhlClubScheduleResponse = await response.json();
    return (data.games || []).sort(byStartAsc).map(transformGame);
  } catch (error) {
    console.error('Error getting NHL team season games:', error);
    return [];
  }
}

/**
 * For the ongoing season, its playoff end date if it has already passed (the
 * season is over), otherwise null. Read live from the schedule response so the
 * current-season page can flip to the champion view without a code change.
 */
export async function getCurrentPlayoffEnd(): Promise<string | null> {
  try {
    // Anchor on the current/upcoming season (re-anchors past an empty today),
    // so we read that season's playoff end rather than a neighbouring season's.
    const response = await fetchSchedule(await effectiveAnchor());
    const end = response.playoffEndDate;
    return end && todayIso() >= end ? end : null;
  } catch {
    return null;
  }
}

function dedupeById(games: NhlScheduleGame[]): NhlScheduleGame[] {
  const seen = new Set<string>();
  const out: NhlScheduleGame[] = [];
  for (const game of games) {
    const id = String(game.id);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(game);
    }
  }
  return out;
}

/** Games on a specific date (YYYY-MM-DD). */
export async function getGamesByDate(date: string): Promise<NHLGame[]> {
  try {
    const response = await fetchSchedule(date);
    const target = new Date(date).toDateString();

    return flattenWeek(response)
      .filter((game) => new Date(game.startTimeUTC).toDateString() === target)
      .sort(byStartAsc)
      .map(transformGame);
  } catch (error) {
    console.error('Error getting NHL games by date:', error);
    return [];
  }
}

export function getNextGameDay(games: NHLGame[]): string | null {
  if (games.length === 0) return null;

  const gameDate = new Date(games[0].startDate);
  return gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
