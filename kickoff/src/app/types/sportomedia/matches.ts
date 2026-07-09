export interface SportomediaMatch {
  id: number;
  /** ISO 8601 UTC, e.g. "2026-04-04T13:00:00.000Z". */
  startDate: string;
  homeTeamName: string;
  visitingTeamName: string;
  homeTeamNameFormatted: string;
  visitingTeamNameFormatted: string;
  homeTeamAbbrv: string;
  visitingTeamAbbrv: string;
  homeTeamEverySportId: number;
  visitingTeamEverySportId: number;
  homeTeamScore: number;
  visitingTeamScore: number;
  /** "FINISHED" | "UPCOMING"; other values are treated as live. */
  status: string;
  extendedStatus: string;
  period: string | null;
  matchMinute: number;
  round: number;
  arenaName: string;
}

export interface SportomediaMatchesData {
  matchesForLeague: {
    matches: SportomediaMatch[];
  };
}
