export interface StatnetTeamNames {
  code: string;
  short: string;
  long: string;
  full: string;
}

export interface StatnetTeamInfo {
  teamNames: StatnetTeamNames;
  logo: string;
}

export interface StatnetTeamStats {
  Rank: number | null;
  Team: number;
  GP: number;
  W: number;
  OTW?: number;
  OTL?: number;
  T: number;
  L: number;
  G: number;
  GPG: string;
  GA: number;
  GAPG: string;
  SOW: number;
  SOL: number;
  Points: number;
  info: StatnetTeamInfo;
}
