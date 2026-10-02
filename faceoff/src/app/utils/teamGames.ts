import type { GameInfo } from '../types/domain/game';
import type { TeamInfo } from '../types/domain/team';

const byStart = (a: GameInfo, b: GameInfo) =>
  new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();

function involves(game: GameInfo, teamCode: string): boolean {
  return (
    game.homeTeamInfo.teamInfo.code === teamCode ||
    game.awayTeamInfo.teamInfo.code === teamCode
  );
}

/** A team's most recent finished games, newest first. */
export function previousGamesFor(
  games: GameInfo[],
  teamCode: string,
  limit: number,
): GameInfo[] {
  return games
    .filter((game) => game.state === 'finished' && involves(game, teamCode))
    .sort((a, b) => byStart(b, a))
    .slice(0, limit);
}

/**
 * A team's coming games, next first. An ongoing game counts — it leads the
 * list until it is finished and moves over to the previous games.
 */
export function upcomingGamesFor(
  games: GameInfo[],
  teamCode: string,
  limit: number,
): GameInfo[] {
  return games
    .filter((game) => game.state !== 'finished' && involves(game, teamCode))
    .sort(byStart)
    .slice(0, limit);
}

/** The next game between two teams still to be finished, either way round. */
export function nextMeeting(
  games: GameInfo[],
  teamCode: string,
  opponentCode: string,
): GameInfo | null {
  return (
    games
      .filter(
        (game) =>
          game.state !== 'finished' &&
          involves(game, teamCode) &&
          involves(game, opponentCode),
      )
      .sort(byStart)[0] ?? null
  );
}

/** Two teams' finished meetings, summed up from the first team's side. */
export interface MeetingTally {
  team: TeamInfo;
  opponent: TeamInfo;
  played: number;
  wins: number;
  losses: number;
  draws: number;
}

/**
 * The season's finished meetings between two teams, either way round, as
 * wins and losses for the first. Null when they haven't met.
 */
export function meetingTally(
  games: GameInfo[],
  teamCode: string,
  opponentCode: string,
): MeetingTally | null {
  const meetings = games.filter(
    (game) =>
      game.state === 'finished' &&
      involves(game, teamCode) &&
      involves(game, opponentCode),
  );
  const first = meetings[0];
  if (!first) return null;

  const tally = { played: meetings.length, wins: 0, losses: 0, draws: 0 };
  for (const game of meetings) {
    const isHome = game.homeTeamInfo.teamInfo.code === teamCode;
    const own = isHome ? game.homeTeamInfo.score : game.awayTeamInfo.score;
    const other = isHome ? game.awayTeamInfo.score : game.homeTeamInfo.score;
    if (own > other) tally.wins++;
    else if (own < other) tally.losses++;
    else tally.draws++;
  }

  const firstIsHome = first.homeTeamInfo.teamInfo.code === teamCode;
  return {
    team: (firstIsHome ? first.homeTeamInfo : first.awayTeamInfo).teamInfo,
    opponent: (firstIsHome ? first.awayTeamInfo : first.homeTeamInfo).teamInfo,
    ...tally,
  };
}

/** A team's info as the schedule carries it, from any of its games. */
export function teamInfoFromGames(
  games: GameInfo[],
  teamCode: string,
): TeamInfo | null {
  for (const game of games) {
    if (game.homeTeamInfo.teamInfo.code === teamCode) {
      return game.homeTeamInfo.teamInfo;
    }
    if (game.awayTeamInfo.teamInfo.code === teamCode) {
      return game.awayTeamInfo.teamInfo;
    }
  }
  return null;
}
