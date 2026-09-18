import {
  CURRENT_SEASON,
  type GameType,
  statnetSeasonsFor,
} from '../config/statnet';
import type { HaGame, HaTeam } from '../types/ha/game';
import type { HaStandingsRow } from '../types/ha/standings';
import type {
  StatnetGameInfo,
  StatnetGameTeamInfo,
  StatnetLeagueResponse,
} from '../types/statnet/game';
import type { StatnetTeamStats } from '../types/statnet/standings';

/**
 * Hockeyallsvenskan moved off the Statnet API in 2026. The new site is a
 * Next.js app that renders its CMS data on the server, so we request the page's
 * RSC payload and lift the data blocks out of it. Everything here is
 * translated into the Statnet response shapes, so the routes and transforms
 * downstream stay league-agnostic.
 *
 * This is scraping: any change to the site's page structure breaks it.
 */
const HA_ORIGIN = 'https://hockeyallsvenskan.se';

/** Pages and the component props that carry their data. */
const GAMES_PAGE = { path: '/pages/matcher', key: 'games' };
const STANDINGS_PAGE = { path: '/pages/tabell', key: 'standings' };

async function fetchRscPayload(path: string): Promise<string> {
  const url = `${HA_ORIGIN}${path}`;
  // `RSC: 1` returns the flight payload instead of HTML: smaller, and the data
  // is plain JSON inside it rather than string-escaped in script tags.
  const response = await fetch(url, {
    headers: {
      RSC: '1',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} (${url})`);
  }
  return response.text();
}

/**
 * Find the first `"<key>":[{` in the payload and parse that array. The end is
 * found by bracket matching that skips string contents, since values such as
 * addresses or URLs may contain brackets.
 */
function extractArray<T>(payload: string, key: string, source: string): T[] {
  const marker = `"${key}":[`;
  const start = payload.indexOf(`${marker}{`);
  if (start === -1) {
    // An empty array is legitimate (e.g. no games yet); anything else means
    // the page structure changed.
    if (payload.includes(`${marker}]`)) return [];
    throw new Error(`HA scrape: "${key}" not found in ${source}`);
  }

  const from = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  for (let i = from; i < payload.length; i++) {
    const c = payload[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
    } else if (c === '[' || c === '{') {
      depth++;
    } else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(payload.slice(from, i + 1)) as T[];
    }
  }
  throw new Error(`HA scrape: unterminated "${key}" array in ${source}`);
}

async function scrapeGames(): Promise<HaGame[]> {
  const payload = await fetchRscPayload(GAMES_PAGE.path);
  return extractArray<HaGame>(payload, GAMES_PAGE.key, GAMES_PAGE.path);
}

async function scrapeStandings(): Promise<HaStandingsRow[]> {
  const payload = await fetchRscPayload(STANDINGS_PAGE.path);
  return extractArray<HaStandingsRow>(
    payload,
    STANDINGS_PAGE.key,
    STANDINGS_PAGE.path,
  );
}

function toStatnetTeam(
  code: string,
  team: HaTeam | undefined,
  score: number | null,
): StatnetGameTeamInfo {
  const logo = team?.logo?.url ?? '';
  return {
    code,
    names: {
      code,
      short: team?.shortName ?? code,
      long: team?.name ?? code,
      full: team?.name ?? code,
    },
    icon: team?.logo?.formats?.thumbnail?.url ?? logo,
    logo,
    score: score ?? 0,
  };
}

function toStatnetGame(game: HaGame): StatnetGameInfo {
  const shootout = (game.homeSoScore ?? 0) + (game.awaySoScore ?? 0) > 0;
  const overtime =
    !shootout && (game.homeOtScore ?? 0) + (game.awayOtScore ?? 0) > 0;
  return {
    uuid: game.documentId,
    startDateTime: game.scheduledDateTime,
    state: game.isCompleted ? 'post-game' : 'pre-game',
    homeTeamInfo: toStatnetTeam(
      game.homeStatNetId,
      game.homeTeam,
      game.homeScore,
    ),
    awayTeamInfo: toStatnetTeam(
      game.awayStatNetId,
      game.awayTeam,
      game.awayScore,
    ),
    venueInfo: { name: game.venue ?? '' },
    overtime,
    shootout,
  };
}

/** The season schedule in the Statnet game-schedule shape. */
export async function fetchHaSchedule(
  gameType: GameType = 'regular',
): Promise<StatnetLeagueResponse> {
  // The calendar only lists the regular season so far; playoff games will
  // presumably be flagged via `playOffGame` once scheduled.
  if (gameType !== 'regular') return { gameInfo: [] };
  const games = await scrapeGames();
  return {
    gameInfo: games
      .filter((game) => !game.playOffGame)
      .map(toStatnetGame)
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)),
  };
}

const num = (value: string | undefined): number => Number(value) || 0;

/**
 * Standings in the Statnet stats-info shape (`[{ dataColumns, stats }]`). The
 * standings block carries no team names or logos, so they are joined in from
 * the schedule by Statnet id.
 */
export async function fetchHaStandings(): Promise<
  { dataColumns: []; stats: StatnetTeamStats[] }[]
> {
  const [rows, schedule] = await Promise.all([
    scrapeStandings(),
    fetchHaSchedule(),
  ]);
  if (rows.length === 0) return [];

  const teams = new Map<string, StatnetGameTeamInfo>();
  for (const game of schedule.gameInfo) {
    teams.set(game.homeTeamInfo.code, game.homeTeamInfo);
    teams.set(game.awayTeamInfo.code, game.awayTeamInfo);
  }

  const stats = rows.map((row): StatnetTeamStats => {
    const team = teams.get(row.teamId);
    const gp = num(row.games_played);
    const goals = num(row.goals);
    const goalsAgainst = num(row.goals_against);
    return {
      Rank: num(row.rank) || null,
      Team: 0,
      GP: gp,
      W: num(row.wins),
      OTW: num(row.overtime_wins),
      OTL: num(row.overtime_losses),
      T: num(row.ties),
      L: num(row.losses),
      G: goals,
      GPG: gp ? (goals / gp).toFixed(2) : '0.00',
      GA: goalsAgainst,
      GAPG: gp ? (goalsAgainst / gp).toFixed(2) : '0.00',
      SOW: num(row.shootouts_wins),
      SOL: num(row.shootouts_losses),
      Points: num(row.total_points),
      info: {
        teamNames: {
          code: row.teamId,
          short: team?.names.short ?? row.teamCode,
          long: team?.names.long ?? row.teamCode,
          full: team?.names.full ?? row.teamCode,
        },
        logo: team?.logo ?? '',
      },
    };
  });

  return [{ dataColumns: [], stats }];
}

/** The HA site only exposes the current season. */
export function assertHaSeason(seasonKey: string): void {
  if (!statnetSeasonsFor('ha').some((s) => s.key === seasonKey)) {
    throw new Error(
      `HA data is only available for the current season (${CURRENT_SEASON.key}), not ${seasonKey}`,
    );
  }
}
