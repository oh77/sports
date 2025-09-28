import {VenueInfo} from "@/app/types/domain/game";

export interface StatnetTeamInfo {
  code: string;
  names: {
    code?: string;
    short: string;
    long: string;
    full: string;
  };
  teamNames: {
    code: string;
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
  homeTeamInfo: StatnetTeamInfo;
  awayTeamInfo: StatnetTeamInfo;
  venueInfo: VenueInfo;
  overtime?: boolean;
  shootout?: boolean;
}

export interface LeagueResponse {
  gameInfo: StatnetGameInfo[];
  teamList?: StatnetTeamInfo[];
}
