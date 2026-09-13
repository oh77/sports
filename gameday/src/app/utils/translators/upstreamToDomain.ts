import { isLeague, LEAGUES } from '@/app/config/leagues';
import type { Game, GameState, GameTeam } from '@/app/types/domain/game';
import type { Sport } from '@/app/types/domain/league';
import type {
  GamesWindowResponse,
  UpstreamGameTeam,
} from '@/app/types/upstream/games-window';

const STATES: GameState[] = ['not-started', 'live', 'finished'];

/**
 * Translate a kickoff/faceoff games-window response into gameday games.
 * Games from leagues gameday doesn't know (or of the wrong sport) and games
 * without a parseable start time are dropped.
 */
export function gamesWindowToDomain(
  sport: Sport,
  baseUrl: string,
  response: GamesWindowResponse,
): Game[] {
  return response.games.flatMap(({ league, game }): Game[] => {
    if (!isLeague(league) || LEAGUES[league].sport !== sport) {
      console.warn(`Skipping game from unknown ${sport} league "${league}"`);
      return [];
    }
    if (Number.isNaN(Date.parse(game.startDateTime))) return [];

    const venue = game.venueInfo?.name?.trim();
    return [
      {
        id: game.uuid,
        sport,
        league,
        // Sources differ in offset style (Z, +02:00, no millis); normalize to
        // UTC so string order is chronological order.
        startDateTime: new Date(game.startDateTime).toISOString(),
        state: STATES.find((s) => s === game.state) ?? 'not-started',
        home: team(game.homeTeamInfo, baseUrl),
        away: team(game.awayTeamInfo, baseUrl),
        venue: venue && venue !== 'n/a' ? venue : undefined,
        roundLabel: game.roundLabel,
      },
    ];
  });
}

function team(
  { teamInfo, score }: UpstreamGameTeam,
  baseUrl: string,
): GameTeam {
  return {
    code: teamInfo.code,
    name: teamInfo.full || teamInfo.short,
    short: teamInfo.short || teamInfo.full,
    // Logos may be app-relative (e.g. kickoff's local assets).
    logo: teamInfo.logo ? new URL(teamInfo.logo, baseUrl).href : undefined,
    score: Number.isFinite(score) ? score : 0,
  };
}
