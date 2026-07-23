import type { TeamInfo } from '@/app/types/domain/team';

export interface TeamStats {
  Rank: number | null;
  Team: number;
  GP: number;
  W: number;
  T?: number;
  L: number;
  G: number;
  GPG: string;
  GA: number;
  GAPG: string;
  OTW?: number;
  OTL?: number;
  SOW: number;
  SOL: number;
  Points: number;
  info: TeamInfo;
  /** Conference name for leagues split into conferences (NHL). */
  conference?: string;
  /** Division name for leagues split into divisions (NHL). */
  division?: string;
}

export interface DataColumn {
  name: string;
  type: string;
  highlighted: boolean;
  group: string;
}

export interface StandingsData {
  dataColumns: DataColumn[];
  stats: TeamStats[];
}
