export interface PulselivePagination {
  _limit: number;
  _prev: string | null;
  _next: string | null;
}

export interface PulseliveMatchTeam {
  name: string;
  id: string;
  shortName: string;
  /** Present in the v2 matches endpoint, absent in v1. */
  abbr?: string;
  /** Only present once a match has started. */
  score?: number;
  halfTimeScore?: number;
  redCards?: number;
}

export interface PulseliveMatch {
  matchId: string;
  /** Local stadium time, "2025-08-22 20:00:00". */
  kickoff: string;
  /** Abbreviation, e.g. "BST". */
  kickoffTimezone: string;
  /** IANA zone, e.g. "Europe/London" (v2 only). */
  kickoffTimezoneString?: string;
  /** "PreMatch" before kick-off, "FullTime" when finished, in-play otherwise. */
  period: string;
  matchWeek?: number;
  phase?: string;
  season?: string;
  competition: string;
  competitionId?: string;
  ground: string;
  homeTeam: PulseliveMatchTeam;
  awayTeam: PulseliveMatchTeam;
  clock?: string;
  resultType?: string;
  attendance?: number;
}

export interface PulseliveMatchesResponse {
  pagination: PulselivePagination;
  data: PulseliveMatch[];
}
