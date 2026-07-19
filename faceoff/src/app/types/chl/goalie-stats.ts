export interface CHLStatProperty {
  _type: string;
  name: string;
  shortName: string;
  value: number | string;
  units?: string;
  negative?: boolean;
}

export interface CHLGoalieStats {
  _type: string;
  _entityId: string;
  externalId: string;
  firstName: string;
  lastName: string;
  number: number;
  nationality: {
    name: string;
    code: string;
  };
  position: {
    _type: string;
    name: string;
    shortName: string;
    category: string;
    order: number;
  };
  stats: {
    _type: string;
    properties: CHLStatProperty[];
  };
  team: {
    _type: string;
    _entityId: string;
    externalId: string;
    name: string;
    shortName: string;
    country: {
      name: string;
      code: string;
    };
  };
}

export interface CHLGoalieStatsApiResponse {
  _type: string;
  data: CHLGoalieStats[];
}
