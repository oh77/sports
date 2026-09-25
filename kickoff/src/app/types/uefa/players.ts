import type { UefaTeam } from '@/app/types/uefa/matches';

/** One metric on a player-ranking row, e.g. `{ name: 'goals', value: '1' }`. */
export interface UefaPlayerStatistic {
  name: string;
  /** Numeric, but serialized as a string ("1", "36.14"). */
  value?: string;
  /** Present on measured metrics only, e.g. `MINUTE`, `KILOMETER`. */
  unit?: string;
}

/**
 * Row in the compstats v2 player-ranking response (sample in
 * docs/endpoints/uefa_champions_league_api.md §3a). Rows carry every
 * requested metric in `statistics`, ordered by the first `stats` code; there
 * is no rank field.
 */
export interface UefaPlayerRankingRow {
  playerId?: string;
  player?: {
    id?: string;
    internationalName?: string;
    imageUrl?: string;
    countryCode?: string;
    fieldPosition?: string;
  };
  teamId?: string;
  team?: UefaTeam;
  statistics?: UefaPlayerStatistic[];
}
