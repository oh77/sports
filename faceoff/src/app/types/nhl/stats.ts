/**
 * NHL statistics API types.
 *
 * Source (different host from schedule/standings):
 *   https://api.nhle.com/stats/rest/en/skater/summary?...
 *   https://api.nhle.com/stats/rest/en/goalie/summary?...
 *
 * Query is driven by a `sort` JSON array and a `cayenneExp` filter, e.g.
 *   gameTypeId=2 and seasonId<=20252026 and seasonId>=20252026
 * (regular season, single season). The response is `{ data, total }`.
 */

/** Skater "summary" row. Only commonly used fields are typed. */
export interface NhlSkaterSummary {
  playerId: number;
  skaterFullName: string;
  lastName: string;
  teamAbbrevs: string;
  positionCode: string;
  shootsCatches: string;
  seasonId: number;

  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  pointsPerGame: number;
  plusMinus: number;
  penaltyMinutes: number;

  evGoals: number;
  evPoints: number;
  ppGoals: number;
  ppPoints: number;
  shGoals: number;
  shPoints: number;
  otGoals: number;
  gameWinningGoals: number;

  shots: number;
  shootingPct: number;
  faceoffWinPct: number;
  timeOnIcePerGame: number;
}

/** Goalie "summary" row. Only commonly used fields are typed. */
export interface NhlGoalieSummary {
  playerId: number;
  goalieFullName: string;
  lastName: string;
  teamAbbrevs: string;
  shootsCatches: string;
  seasonId: number;

  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  ties?: number;

  savePct: number;
  goalsAgainstAverage: number;
  shutouts: number;
  saves: number;
  shotsAgainst: number;
  goalsAgainst: number;

  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
}

export interface NhlStatsResponse<T> {
  data: T[];
  total: number;
}
