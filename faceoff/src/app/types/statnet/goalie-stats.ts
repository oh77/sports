export interface StatnetGoalieInfo {
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

export interface StatnetGoalieStats {
  Rank: number | null;
  Player: number;
  Team: number;
  GP: number; // Games Played
  SVS: number; // Saves
  GA: number; // Goals Against
  SVSPerc: string; // Save Percentage (may be SVSper or SVS%)
  GAA: string; // Goals Against Average
  SO: number; // Shutouts
  info: StatnetGoalieInfo;
}

export interface StatnetDataColumn {
  name: string;
  type: string;
  highlighted: boolean;
  group: string;
}

export interface StatnetGoalieStatsData {
  dataColumns: StatnetDataColumn[];
  defaultSortKey: {
    name: string;
    order: string;
  };
  stats: StatnetGoalieStats[];
}
