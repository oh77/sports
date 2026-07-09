import type { UefaTeam } from '@/app/types/uefa/matches';

/**
 * Row in the compstats player-ranking response. The endpoint docs describe
 * the shape tersely ({ player, team, value, rank }); every field is treated
 * as optional and rows without a player id are dropped.
 */
export interface UefaPlayerRankingRow {
  rank?: number;
  /** The value of the requested `stats` metric (one metric per request). */
  value?: number;
  player?: {
    id?: string;
    internationalName?: string;
    imageUrl?: string;
    countryCode?: string;
    fieldPosition?: string;
  };
  team?: UefaTeam;
}
