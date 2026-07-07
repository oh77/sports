import type { DataColumn, SortKey } from '@/app/types/domain/data-table';
import type { PlayerInfo } from '@/app/types/domain/player-stats';

export type KeeperInfo = PlayerInfo;

export interface KeeperStats {
  Rank: number | null;
  GP: number; // Games Played
  CS: number; // Clean Sheets
  GA: number; // Goals Against
  GAA?: string; // Goals Against per Game
  SVS?: number; // Saves
  SVSPerc?: string; // Save Percentage
  info: KeeperInfo;
}

export interface KeeperStatsData {
  dataColumns: DataColumn[];
  defaultSortKey: SortKey;
  stats: KeeperStats[];
}
