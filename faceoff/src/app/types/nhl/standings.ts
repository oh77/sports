/**
 * NHL standings API types.
 *
 * Source: https://api-web.nhle.com/v1/standings/<YYYY-MM-DD>
 *
 * The endpoint returns a flat array of 32 team rows (one per club), each tagged
 * with its conference and division plus a large set of record and ranking
 * fields. An upcoming/not-yet-started season returns `standings: []`.
 */

import type { NhlLocalizedName } from './game';

/**
 * A single team's standing. Only the fields the app consumes are typed
 * explicitly; the raw payload contains many more (home/road splits, per-metric
 * league sequences, percentages, …).
 */
export interface NhlStandingsRow {
  // Identity
  teamName: NhlLocalizedName;
  teamCommonName: NhlLocalizedName;
  teamAbbrev: NhlLocalizedName;
  placeName: NhlLocalizedName;
  teamLogo: string;
  teamLogoDark: string;

  // Grouping
  conferenceName: string;
  conferenceAbbrev: string;
  conferenceSequence: number;
  divisionName: string;
  divisionAbbrev: string;
  divisionSequence: number;
  leagueSequence: number;
  wildcardSequence: number;

  // Record
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  ties: number;
  points: number;
  pointPctg: number;
  regulationWins: number;
  regulationPlusOtWins: number;

  // Goals
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;

  // Last 10 + streak
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  streakCode: string;
  streakCount: number;

  // Season / clinch
  seasonId: number;
  gameTypeId: number;
  clinchIndicator?: string;
}

export interface NhlStandingsResponse {
  wildCardIndicator: boolean;
  standingsDateTimeUtc?: string;
  standings: NhlStandingsRow[];
}
