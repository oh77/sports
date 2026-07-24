import type { TeamInfo } from '@/app/types/domain/team';

export type MatchState = 'not-started' | 'live' | 'finished';

export interface MatchTeamInfo {
  teamInfo: TeamInfo;
  score: number;
  /** Penalty shoot-out goals; set only when the match went to penalties. */
  penaltyScore?: number;
  /**
   * Running tie total for two-legged knockout games: the other leg's result
   * plus this leg's current score. On an upcoming second leg that is just the
   * first-leg result carried over; once the tie is decided it is the final
   * aggregate. Only set when the tie's other leg is known.
   */
  aggregateScore?: number;
}

export interface VenueInfo {
  name: string;
}

export interface MatchInfo {
  uuid: string;
  /** Kick-off time, ISO 8601 with offset. */
  startDateTime: string;
  state: MatchState;
  homeTeamInfo: MatchTeamInfo;
  awayTeamInfo: MatchTeamInfo;
  venueInfo: VenueInfo;
  /** Matchday/round number within the phase, when the source provides one. */
  round?: number;
  /** Human-readable phase or round, e.g. "Omgång 12", "Åttondelsfinal". */
  roundLabel?: string;
  /**
   * Cup competitions: the match belongs to a knockout round, which
   * `roundLabel` names. League/group-phase matches leave this unset.
   */
  knockout?: boolean;
  /**
   * Two-legged knockout ties: which leg this match is, and how many legs the
   * tie has. Absent for one-off matches.
   */
  leg?: { number: number; of: number };
  /** Knockout matches only: decided after extra time. */
  extraTime?: boolean;
  /** Knockout matches only: decided on penalties (see penaltyScore). */
  penalties?: boolean;
  /** Cup competitions: the match belongs to a qualifying phase. */
  qualifying?: boolean;
  /** Cup competitions: the match is the final (decides the champion). */
  isFinal?: boolean;
}

export interface MatchesData {
  matches: MatchInfo[];
}
