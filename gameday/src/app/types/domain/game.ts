import type { League, Sport } from '@/app/types/domain/league';

export type GameState = 'not-started' | 'live' | 'finished';

export interface GameTeam {
  /** Team code in its league — the `[teamCode]` segment in kickoff/faceoff URLs. */
  code: string;
  /** Full display name, e.g. "Malmö FF". */
  name: string;
  /** Short display name for narrow layouts. */
  short: string;
  /** Absolute logo URL, when the source provides one. */
  logo?: string;
  score: number;
}

export interface Game {
  id: string;
  sport: Sport;
  league: League;
  /** Start time, UTC ISO 8601 (`toISOString()`), so string order is chronological. */
  startDateTime: string;
  state: GameState;
  home: GameTeam;
  away: GameTeam;
  venue?: string;
  /** Human-readable phase or round, e.g. "Omgång 12" (football only). */
  roundLabel?: string;
}
