import type { TeamInfo } from '@/app/types/domain/team';

export type GameState = 'finished' | 'not-started' | 'live';

/**
 * Which phase of the season a game belongs to. Only filled where the source
 * feed reports it (NHL `gameType`: 1 = preseason, 2 = regular, 3 = playoffs);
 * left undefined elsewhere, where a listing is regular-season by construction.
 */
export type GamePhase = 'preseason' | 'regular' | 'playoffs';

export interface GameTeamInfo {
  teamInfo: TeamInfo;
  score: number;
}

export interface VenueInfo {
  name: string;
}

export interface GameInfo {
  uuid: string;
  startDateTime: string;
  state: GameState;
  homeTeamInfo: GameTeamInfo;
  awayTeamInfo: GameTeamInfo;
  venueInfo: VenueInfo;
  overtime?: boolean;
  shootout?: boolean;
  phase?: GamePhase;
}

export interface LeagueResponse {
  gameInfo: GameInfo[];
  teamList?: GameTeamInfo[];
}
