import type { League } from '../types/domain/league';

/**
 * Statnet-backed leagues (CHL uses a separate API and is not configured here).
 */
export type StatnetLeague = Extract<League, 'shl' | 'sdhl'>;

/** Schedule game types. Regular season + playoffs are shared across leagues. */
export type GameType = 'regular' | 'playoffs' | 'qualifying';

/**
 * Per-league constants that stay the same across seasons.
 * - `seriesUuid` identifies the league's series in the Statnet schedule API.
 * - `provider` is the stats provider used by the statistics API.
 * - `gameTypes` are the per-phase schedule ids (qualifying differs per league).
 */
export const STATNET_LEAGUES: Record<
  StatnetLeague,
  {
    host: string;
    seriesUuid: string;
    provider: string;
    gameTypes: Record<GameType, string>;
  }
> = {
  shl: {
    host: 'www.shl.se',
    seriesUuid: 'qQ9-bb0bzEWUk',
    provider: 'statnet',
    gameTypes: {
      regular: 'qQ9-af37Ti40B',
      playoffs: 'qQ9-7debq38kX',
      qualifying: 'qRf-347BaDIOc',
    },
  },
  sdhl: {
    host: 'www.sdhl.se',
    seriesUuid: 'qQ9-f438G8BXP',
    provider: 'impleo',
    gameTypes: {
      regular: 'qQ9-af37Ti40B',
      playoffs: 'qQ9-7debq38kX',
      qualifying: 'qRe-AJog2gISz',
    },
  },
};

/**
 * Per-season configuration.
 * - `seasonUuid` is shared by both leagues for a given season.
 * - `ssgtUuid` is the statistics group id and differs per league *and* per season.
 */
export type SeasonConfig = {
  /** URL-facing season key, e.g. "25-26". */
  key: string;
  /** Marks the season used when no explicit season is requested. */
  current?: boolean;
  seasonUuid: string;
  ssgtUuid: Record<StatnetLeague, string>;
};

/**
 * Known seasons. Add new seasons here; mark exactly one as `current`.
 */
export const STATNET_SEASONS: SeasonConfig[] = [
  {
    key: '26-27',
    current: true,
    seasonUuid: 'ndcf81nlb3',
    ssgtUuid: { shl: 'qa98unlbd6', sdhl: 'mgmsaolpsm' },
  },
  {
    key: '25-26',
    seasonUuid: 'xs4m9qupsi',
    ssgtUuid: { shl: 'iuzqg7dqk9', sdhl: 'n5mqrxbg0g' },
  },
];

export const CURRENT_SEASON: SeasonConfig =
  STATNET_SEASONS.find((s) => s.current) ?? STATNET_SEASONS[0];

/**
 * Resolve a season key to its config, falling back to the current season for
 * missing or unknown keys.
 */
export function resolveSeason(key?: string | null): SeasonConfig {
  if (!key) return CURRENT_SEASON;
  return STATNET_SEASONS.find((s) => s.key === key) ?? CURRENT_SEASON;
}
