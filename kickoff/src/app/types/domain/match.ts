import type { TeamInfo } from '@/app/types/domain/team';

export type MatchState = 'not-started' | 'live' | 'finished';

export interface MatchTeamInfo {
  teamInfo: TeamInfo;
  score: number;
  /** Penalty shoot-out goals; set only when the match went to penalties. */
  penaltyScore?: number;
  /** Tie total for two-legged knockout games, when the provider supplies it. */
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
