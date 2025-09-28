export interface CHLTeam {
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
}

export interface CHLVenue {
  _type: string;
  _entityId: string;
  name: string;
}

export interface CHLStage {
  _type: string;
  group: {
    order: number;
    name: string;
  };
  round: {
    order: number;
    name: string;
  };
}

export interface CHLState {
  _type: string;
  name: string;
  shortName: string;
}

export interface CHLScores {
  _type: string;
  home: number;
  away: number;
}

export interface CHLResults {
  _type: string;
  scores: CHLScores;
}

export interface CHLMatch {
  _type: string;
  _entityId: string;
  _modifyDate: string;
  externalId: string;
  startDate: string;
  startDateNotConfirmed: boolean;
  status: 'finished' | 'not-started' | 'live' | 'postponed' | 'cancelled';
  link: {
    _type: string;
    url: string;
    isWeb: boolean;
    pageEntityId: string;
  };
  venue: CHLVenue;
  stage: CHLStage;
  teams: {
    home: CHLTeam;
    away: CHLTeam;
  };
  state: CHLState;
  results?: CHLResults;
}

export interface CHLApiResponse {
  _type: string;
  data: CHLMatch[];
  errors: unknown[];
}

export interface CHLTeamInfo {
  _type: string;
  _entityId: string;
  externalId: string;
  name: string;
  shortName: string;
  country: {
    name: string;
    code: string;
  };
  link: {
    _type: string;
    pageEntityId: string;
    url: string;
    isWeb: boolean;
  };
}

export interface CHLTeamsApiResponse {
  _type: string;
  data: CHLTeamInfo[];
  errors: unknown[];
  includes: unknown[];
}

export interface CHLGame {
  id: string;
  externalId: string;
  startDate: string;
  status: string;
  venue: string;
  homeTeam: {
    name: string;
    shortName: string;
    externalId: string;
    country?: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    externalId: string;
    country?: string;
  };
  scores?: {
    home: number;
    away: number;
  };
  state: string;
  round: string;
  group: string;
}
