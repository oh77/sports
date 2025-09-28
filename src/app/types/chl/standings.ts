export interface CHLTeamStats {
  _type: string;
  _entityId: string;
  externalId: string;
  name: string;
  shortName: string;
  link: {
    _type: string;
    pageEntityId: string;
    url: string;
    isWeb: boolean;
  };
  stats: {
    _type: string;
    place: number;
    points: number;
    isLive: boolean;
    placeChange: number;
    pointsPercentage: number;
    matches: {
      played: {
        total: number;
      };
      won: {
        total: number;
        overtimes: number;
        shootouts: number;
      };
      lost: {
        total: number;
        overtimes: number;
        shootouts: number;
      };
      drawn: number;
    };
    goals: {
      scored: {
        total: number;
      };
      conceded: {
        total: number;
      };
    };
  };
}

export interface CHLStandingsData {
  _type: string;
  _entityId: string;
  status: string;
  stage: {
    _type: string;
    group: {
      order: number;
      name: string;
    };
  };
  teams: CHLTeamStats[];
  results: {
    _type: string;
    winners: Array<{
      _type: string;
      _entityId: string;
      _ref: boolean;
    }>;
  };
}

export interface CHLStandingsApiResponse {
  _type: string;
  data: CHLStandingsData[];
  errors: unknown[];
}

// Transformed data structure for components
export interface CHLStandingsTeam {
  rank: number;
  name: string;
  shortName: string;
  externalId: string;
  points: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  pointsPercentage: number;
  logo?: string;
}

export interface CHLStandingsDataTransformed {
  teams: CHLStandingsTeam[];
  season: string;
  lastUpdated: string;
}
