import {VenueInfo} from "@/app/types/domain/game";

export interface StatnetGameTeamInfo {
  code: string;
  names: {
    code?: string;
    short: string;
    long: string;
    full: string;
  };
  icon: string;
  logo: string;
  score: number;
}

export interface StatnetGameInfo {
  uuid: string;
  startDateTime: string;
  state: string;
  homeTeamInfo: StatnetGameTeamInfo;
  awayTeamInfo: StatnetGameTeamInfo;
  venueInfo: VenueInfo;
  overtime?: boolean;
  shootout?: boolean;
}

export interface StatnetLeagueResponse {
  gameInfo: StatnetGameInfo[];
  teamList?: StatnetGameTeamInfo[];
}
