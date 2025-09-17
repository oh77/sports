export interface TeamInfo {
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

export interface VenueInfo {
  name: string;
}

export interface GameInfo {
  uuid: string;
  startDateTime: string;
  state: string;
  homeTeamInfo: TeamInfo;
  awayTeamInfo: TeamInfo;
  venueInfo: VenueInfo;
}

export interface LeagueResponse {
  gameInfo: GameInfo[];
  teamList?: TeamInfo[];
}
