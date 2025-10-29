export interface StatnetPlayerInfo {
  uuid: string;
  fullName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  number: number;
  position: string;
  shoots: string | null;
  gender: string;
  weight: {
    value: number;
    format: string;
  };
  height: {
    value: number;
    format: string;
  };
  playerMedia: {
    id: number;
    mediaString: string;
    type: string;
    sortOrder: number;
  };
  team: {
    uuid: string;
    name: string;
    code: string;
    media: string;
    ownerInstanceId: string;
    siteDisplayName: string;
  };
  teamCode: number;
  teamId: string;
}

export interface StatnetPlayerStats {
  Rank: number | null;
  Player: number;
  Team: number;
  GP: number; // Games Played
  TP: number; // Total Points
  G: number;  // Goals
  A: number;  // Assists
  PPG: number; // Power Play Goals
  PPA: number; // Power Play Assists
  PPTP: number; // Power Play Total Points
  SHG: number; // Short Handed Goals
  SHA: number; // Short Handed Assists
  SHTP: number; // Short Handed Total Points
  info: StatnetPlayerInfo;
}

export interface StatnetDataColumn {
  name: string;
  type: string;
  highlighted: boolean;
  group: string;
}

export interface StatnetPlayerStatsData {
  dataColumns: StatnetDataColumn[];
  defaultSortKey: {
    name: string;
    order: string;
  };
  stats: StatnetPlayerStats[];
}