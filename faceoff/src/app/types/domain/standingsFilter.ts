/**
 * A single month of a season, keyed `YYYY-MM` (e.g. "2026-09").
 *
 * The year is part of the key so a season that spans the new year sorts
 * chronologically — September before January — rather than by month number.
 */
export type MonthFilter = `${number}-${number}`;

export type StandingsFilter =
  | 'season'
  | 'home'
  | 'away'
  | 'last5'
  | 'last10'
  | 'last15'
  | MonthFilter;
