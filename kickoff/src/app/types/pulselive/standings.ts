export interface PulseliveStandingsSplit {
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  startingPosition?: number;
}

export interface PulseliveStandingsEntry {
  team: {
    name: string;
    id: string;
    shortName: string;
    abbr: string;
  };
  overall: PulseliveStandingsSplit;
  home: PulseliveStandingsSplit;
  away: PulseliveStandingsSplit;
}

export interface PulseliveStandingsResponse {
  matchweek: number;
  tables: { entries: PulseliveStandingsEntry[] }[];
  season: { name: string; id: string };
  competition: { code: string; name: string; id: string };
  deductions: unknown[];
  live: boolean;
}
