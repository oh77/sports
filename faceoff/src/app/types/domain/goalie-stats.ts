import type { PlayerInfo } from './player-stats';

export type GoalieInfo = PlayerInfo;

export interface GoalieStats {
  Rank: number | null;
  Player: number;
  Team: number;
  GP: number; // Games Played
  SVS: number; // Saves
  GA: number; // Goals Against
  SVSPerc: string; // Save Percentage
  GAA: string; // Goals Against Average
  SO: number; // Shutouts
  info: GoalieInfo;
}

export interface GoalieStatsData {
  dataColumns: {
    name: string;
    type: string;
    highlighted: boolean;
    group: string;
  }[];
  defaultSortKey: {
    name: string;
    order: string;
  };
  stats: GoalieStats[];
}
