export interface TeamInfo {
  /** URL-safe slug used in routes, e.g. "mff", "arsenal". */
  code: string;
  /** Id of the team in the source API. */
  externalId: string;
  short: string;
  long: string;
  full: string;
  logo: string;
  /**
   * Home country of the club. Only meaningful for multi-nation competitions
   * (Champions League); single-country leagues leave it undefined.
   */
  country?: TeamCountry;
}

export interface TeamCountry {
  /** Association code, e.g. "ENG", "FRA". */
  code: string;
  /** Localised (Swedish) country name; falls back to the code when unknown. */
  name: string;
  /** Flag image URL. */
  flag: string;
}
