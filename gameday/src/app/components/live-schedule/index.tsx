'use client';

import { useEffect, useState } from 'react';
import { GameList } from '@/app/components/game-list';
import {
  type LeagueLoad,
  LeagueProgress,
} from '@/app/components/league-progress';
import { LEAGUES } from '@/app/config/leagues';
import type { Game } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import { isFavoriteGame } from '@/app/utils/favorites';

type Props = {
  /** Day keys to show, in order. */
  days: string[];
  onlyFavorites: boolean;
};

/** A league's games once loaded, or `'failed'`; absent while loading. */
type Loaded = Partial<Record<League, Game[] | 'failed'>>;

const ALL_LEAGUES = Object.keys(LEAGUES) as League[];

/**
 * Loads every league in parallel from `/api/games` and merges each into the
 * day list as it arrives, with a status chip per league.
 */
export function LiveSchedule({ days, onlyFavorites }: Props) {
  const from = days[0];
  const to = days[days.length - 1];
  const [loaded, setLoaded] = useState<Loaded>({});
  const [hidden, setHidden] = useState<ReadonlySet<League>>(new Set());

  const toggle = (league: League) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(league)) next.add(league);
      return next;
    });

  useEffect(() => {
    const controller = new AbortController();
    for (const league of ALL_LEAGUES) {
      fetchLeague(league, from, to, controller.signal).then(
        (games) => {
          if (controller.signal.aborted) return;
          setLoaded((prev) => ({ ...prev, [league]: games }));
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          console.error(`Failed to load ${league}:`, error);
          setLoaded((prev) => ({ ...prev, [league]: 'failed' }));
        },
      );
    }
    return () => controller.abort();
  }, [from, to]);

  const shown = (game: Game) => !onlyFavorites || isFavoriteGame(game);

  const statuses: LeagueLoad[] = ALL_LEAGUES.map((league) => {
    const result = loaded[league];
    const visible = !hidden.has(league);
    if (result === undefined || result === 'failed') {
      const state = result === 'failed' ? 'failed' : 'loading';
      return { league, state, count: 0, visible };
    }
    return {
      league,
      state: 'done',
      count: result.filter(shown).length,
      visible,
    };
  });

  const games = ALL_LEAGUES.flatMap((league) => {
    const result = loaded[league];
    return Array.isArray(result) && !hidden.has(league)
      ? result.filter(shown)
      : [];
  }).sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  const pending = statuses.some((s) => s.state === 'loading');
  let emptyText = onlyFavorites
    ? 'Inga matcher för favoritlagen'
    : 'Inga matcher';
  if (pending) emptyText = 'Hämtar matcher…';

  return (
    <>
      <LeagueProgress
        leagues={statuses}
        onToggle={toggle}
        onShowAll={() => setHidden(new Set())}
      />
      <GameList games={games} days={days} emptyText={emptyText} animateIn />
    </>
  );
}

async function fetchLeague(
  league: League,
  from: string,
  to: string,
  signal: AbortSignal,
): Promise<Game[]> {
  const params = new URLSearchParams({ league, from, to });
  const response = await fetch(`/api/games?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`/api/games?${params} responded ${response.status}`);
  }
  const data: { games: Game[] } = await response.json();
  return data.games;
}
