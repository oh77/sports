import type { DataColumn, SortKey } from '@/app/types/domain/data-table';

export interface PlayerTeamRef {
  externalId: string;
  name: string;
  code: string;
  logo?: string;
}

export interface PlayerInfo {
  uuid: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nationality?: string;
  position?: string;
  number?: number;
  birthDate?: string;
  photo?: string;
  team: PlayerTeamRef;
}

export interface PlayerStats {
  Rank: number | null;
  GP: number; // Games Played
  G: number; // Goals
  A: number; // Assists
  TP: number; // Total Points (goals + assists)
  YC: number; // Yellow Cards
  RC: number; // Red Cards
  MIN?: number; // Minutes Played
  PG?: number; // Penalty Goals
  info: PlayerInfo;
}

export interface PlayerStatsData {
  dataColumns: DataColumn[];
  defaultSortKey: SortKey;
  stats: PlayerStats[];
}
