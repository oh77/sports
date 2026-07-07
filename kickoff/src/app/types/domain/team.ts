export interface TeamInfo {
  /** URL-safe slug used in routes, e.g. "mff", "arsenal". */
  code: string;
  /** Id of the team in the source API. */
  externalId: string;
  short: string;
  long: string;
  full: string;
  logo: string;
}
