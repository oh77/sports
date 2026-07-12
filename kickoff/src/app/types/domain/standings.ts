import type { DataColumn } from '@/app/types/domain/data-table';
import type { TeamInfo } from '@/app/types/domain/team';

/** Result letters for form/trend markers, most recent last. */
export type MatchOutcome = 'W' | 'D' | 'L';

/**
 * Qualification/relegation zone a rank falls in. Rendered as a marker with a
 * text alternative, never color alone.
 */
export type StandingsZone =
  | 'title'
  | 'championsLeague'
  | 'europe'
  | 'relegationPlayoff'
  | 'relegation'
  | 'knockout'
  | 'knockoutPlayoff';

/** Aggregate record over one venue side's games only (home or away). */
export interface SideRecord {
  GP: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
}

export interface TeamStanding {
  Rank: number | null;
  GP: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Points: number;
  zone?: StandingsZone;
  /** Group/phase name for group-based formats (e.g. CL); absent for a single table. */
  group?: string;
  /** Last five results, most recent last. */
  form?: MatchOutcome[];
  /** Record in home games only, when the source can provide or derive it. */
  homeRecord?: SideRecord;
  /** Record in away games only, when the source can provide or derive it. */
  awayRecord?: SideRecord;
  info: TeamInfo;
}

export interface StandingsData {
  dataColumns: DataColumn[];
  stats: TeamStanding[];
}
