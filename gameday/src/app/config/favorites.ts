import type { League } from '@/app/types/domain/league';

export type FavoriteTeam = {
  /** Display name on the favorites page. */
  name: string;
  /**
   * The team's code per league it plays in. The code is the `[teamCode]`
   * segment of the team's page in kickoff/faceoff, e.g. `/pl/26-27/arsenal`
   * → `arsenal`, `/nhl/26-27/DET` → `DET` (matched case-insensitively).
   * Cup competitions usually use a different code than the domestic league,
   * so add one entry per competition the team should be followed in.
   */
  codes: Partial<Record<League, string>>;
};

/** Favorite teams. Drives the favorites page and the calendar feed. */
export const FAVORITES: FavoriteTeam[] = [
  { name: 'IFK Göteborg', codes: { allsvenskan: 'gbg' } },
  { name: 'Liverpool', codes: { pl: 'liv', cl: 'liv' } },
  { name: 'Frölunda HC', codes: { shl: 'FHC', chl: 'FHC', sdhl: 'FHC' } },
  { name: 'Leksands IF', codes: { ha: 'LIF' } },
  { name: 'Buffalo Sabres', codes: { nhl: 'BUF' } },
  { name: 'San Jose Sharks', codes: { nhl: 'SJS' } },
  { name: 'Detroit Red Wings', codes: { nhl: 'DET' } },
];
