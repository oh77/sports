/**
 * NHL schedule API types.
 *
 * Source: https://api-web.nhle.com/v1/schedule/<YYYY-MM-DD>
 *
 * The endpoint is date-anchored: a single call returns the game week that
 * contains the requested date (`gameWeek`) plus `nextStartDate` /
 * `previousStartDate` pointers used to walk the schedule one week at a time.
 */

/** Localised string map. Only `default` is guaranteed present. */
export interface NhlLocalizedName {
  default: string;
  fr?: string;
  es?: string;
}

/**
 * Raw game lifecycle state.
 * - `FUT` / `PRE`  – scheduled, not started
 * - `LIVE` / `CRIT` – in progress (CRIT = final minutes / OT)
 * - `OFF` / `FINAL` – completed
 */
export type NhlGameState = 'FUT' | 'PRE' | 'LIVE' | 'CRIT' | 'OFF' | 'FINAL';

export interface NhlScheduleTeam {
  id: number;
  commonName: NhlLocalizedName;
  placeName: NhlLocalizedName;
  placeNameWithPreposition?: NhlLocalizedName;
  abbrev: string;
  /** Logo variant for light backgrounds (…_light.svg). */
  logo: string;
  /** Logo variant for dark backgrounds (…_dark.svg). */
  darkLogo: string;
  /** Present once the game has started. */
  score?: number;
  awaySplitSquad?: boolean;
  homeSplitSquad?: boolean;
  radioLink?: string;
}

export interface NhlVenue {
  default: string;
  es?: string;
  fr?: string;
}

export interface NhlScheduleGame {
  id: number;
  season: number;
  /** 1 = preseason, 2 = regular season, 3 = playoffs. */
  gameType: number;
  venue: NhlVenue;
  neutralSite: boolean;
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  venueTimezone: string;
  gameState: NhlGameState;
  gameScheduleState: string;
  awayTeam: NhlScheduleTeam;
  homeTeam: NhlScheduleTeam;
  /** Present on finished games; `lastPeriodType` is REG / OT / SO. */
  gameOutcome?: { lastPeriodType?: string };
  /** Present in the club-schedule-season feed (YYYY-MM-DD, local). */
  gameDate?: string;
  gameCenterLink: string;
}

export interface NhlGameDay {
  date: string;
  dayAbbrev: string;
  numberOfGames: number;
  games: NhlScheduleGame[];
}

export interface NhlScheduleResponse {
  nextStartDate: string;
  previousStartDate: string;
  gameWeek: NhlGameDay[];
  preSeasonStartDate?: string;
  regularSeasonStartDate?: string;
  regularSeasonEndDate?: string;
  playoffEndDate?: string;
  numberOfGames?: number;
}

/**
 * A club's full-season schedule.
 * Source: https://api-web.nhle.com/v1/club-schedule-season/<TEAM>/<SEASON>
 * A flat `games` array (no game-week grouping).
 */
export interface NhlClubScheduleResponse {
  previousSeason?: number;
  currentSeason?: number;
  nextSeason?: number;
  games: NhlScheduleGame[];
}

/** Normalised game status the translator consumes. */
export type NHLGameStatus = 'finished' | 'not-started' | 'live';

/** Flattened team shape produced by the service. */
export interface NHLGameTeam {
  id: number;
  abbrev: string;
  /** Nickname, e.g. "Panthers". */
  commonName: string;
  /** Location, e.g. "Florida". */
  placeName: string;
  logo: string;
}

/**
 * Flattened intermediate the service produces and the translator consumes,
 * mirroring the CHL `CHLGame` shape.
 */
export interface NHLGame {
  id: string;
  startDate: string;
  status: NHLGameStatus;
  venue: string;
  homeTeam: NHLGameTeam;
  awayTeam: NHLGameTeam;
  scores?: {
    home: number;
    away: number;
  };
  overtime?: boolean;
  shootout?: boolean;
  /** 1 = preseason, 2 = regular season, 3 = playoffs. */
  gameType: number;
}
