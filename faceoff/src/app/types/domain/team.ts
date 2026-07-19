export interface TeamInfo {
  code: string;
  externalId: string;
  short: string;
  long: string;
  full: string;
  logo: string;
  /** ISO 3166-1 alpha-2 country code for flag display (CHL teams). */
  country?: string;
}
