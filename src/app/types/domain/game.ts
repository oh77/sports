import type { TeamInfo } from '@/app/types/domain/team';

export type GameState = 'finished' | 'not-started' | 'live';

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
}

export interface LeagueResponse {
  gameInfo: GameInfo[];
  teamList?: GameTeamInfo[];
}
