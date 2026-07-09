/** Localised label map, e.g. { EN: "Final", FR: "Finale" }. */
export type UefaTranslations = Record<string, string>;

export interface UefaTeam {
  id: string;
  teamCode?: string;
  internationalName: string;
  countryCode?: string;
  logoUrl?: string;
  mediumLogoUrl?: string;
  bigLogoUrl?: string;
  translations?: {
    displayOfficialName?: UefaTranslations;
  };
}

export interface UefaScorePair {
  home: number;
  away: number;
}

export interface UefaMatch {
  id: string;
  /** "UPCOMING" | "LIVE" | "FINISHED". */
  status: string;
  competitionPhase?: string;
  kickOffTime?: {
    date?: string;
    /** ISO 8601 UTC. */
    dateTime?: string;
    utcOffsetInHours?: number;
  };
  fullTimeAt?: string;
  matchAttendance?: number;
  /** Absent for knockout fixtures whose participants aren't decided yet. */
  homeTeam?: UefaTeam;
  awayTeam?: UefaTeam;
  score?: {
    regular?: UefaScorePair;
    /** Only present on the leg where a shoot-out actually happened. */
    penalty?: UefaScorePair;
    total?: UefaScorePair;
    /** Two-legged ties: the tie total (backfilled onto both legs). */
    aggregate?: UefaScorePair;
  };
  winner?: {
    match?: {
      /** "WIN_REGULAR" | "WIN_ON_EXTRA_TIME" | "WIN_ON_PENALTIES" | "DRAW" | … */
      reason?: string;
      team?: { id: string };
    };
    /**
     * Two-legged ties: how the tie was decided. Present on both legs (the
     * first leg gets it backfilled once the tie is over).
     */
    aggregate?: {
      reason?: string;
      team?: { id: string };
    };
  };
  /** "FIRST_LEG" | "SECOND_LEG" for two-legged ties; absent for one-offs. */
  type?: string;
  leg?: {
    number?: number;
  };
  matchday?: {
    id?: string;
    name?: string;
    longName?: string;
    phase?: string;
  };
  round?: {
    id?: string;
    metaData?: { name?: string; type?: string };
    mode?: string;
  };
  stadium?: {
    id?: string;
    translations?: { officialName?: UefaTranslations };
    city?: {
      translations?: { name?: UefaTranslations };
      countryCode?: string;
    };
  };
}
