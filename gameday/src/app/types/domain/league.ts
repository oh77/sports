export type Sport = 'football' | 'hockey';

/** League keys as used by kickoff. */
export type FootballLeague =
  | 'allsvenskan'
  | 'superettan'
  | 'pl'
  | 'cl'
  | 'el'
  | 'col';

/** League keys as used by faceoff. */
export type HockeyLeague = 'shl' | 'sdhl' | 'ha' | 'chl' | 'nhl';

export type League = FootballLeague | HockeyLeague;
