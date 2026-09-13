'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

/** A league's games once loaded, or the log line of its failure. */
type LeagueResult = { games: Game[] } | { error: string };

/** Absent (or undefined) while the league is loading. */
type Loaded = Partial<Record<League, LeagueResult>>;

const ALL_LEAGUES = Object.keys(LEAGUES) as League[];

/**
 * Loads every league in parallel from `/api/games` and merges each into the
 * day list as it arrives, with a status chip per league. Failed leagues can be
 * retried.
 */
export function LiveSchedule({ days, onlyFavorites }: Props) {
  const from = days[0];
  const to = days[days.length - 1];
  const [loaded, setLoaded] = useState<Loaded>({});
  const [hidden, setHidden] = useState<ReadonlySet<League>>(new Set());
  const controllerRef = useRef<AbortController>(null);

  const toggle = (league: League) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(league)) next.add(league);
      return next;
    });

  const load = useCallback(
    (league: League) => {
      const signal = controllerRef.current?.signal;
      if (!signal) return;
      fetchLeague(league, from, to, signal).then(
        (games) => {
          if (signal.aborted) return;
          setLoaded((prev) => ({ ...prev, [league]: { games } }));
        },
        (error: unknown) => {
          if (signal.aborted) return;
          console.error(`Failed to load ${league}:`, error);
          const message =
            error instanceof Error ? error.message : String(error);
          const time = new Date().toLocaleTimeString('sv-SE');
          setLoaded((prev) => ({
            ...prev,
            [league]: { error: `${time} ${message}` },
          }));
        },
      );
    },
    [from, to],
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    for (const league of ALL_LEAGUES) load(league);
    return () => controller.abort();
  }, [load]);

  const retry = (leagues: League[]) => {
    setLoaded((prev) => {
      const next = { ...prev };
      for (const league of leagues) next[league] = undefined;
      return next;
    });
    for (const league of leagues) load(league);
  };

  const shown = (game: Game) => !onlyFavorites || isFavoriteGame(game);

  const statuses: LeagueLoad[] = ALL_LEAGUES.map((league) => {
    const result = loaded[league];
    const visible = !hidden.has(league);
    if (!result) return { league, state: 'loading', count: 0, visible };
    if ('error' in result) {
      return {
        league,
        state: 'failed',
        count: 0,
        visible,
        error: result.error,
      };
    }
    return {
      league,
      state: 'done',
      count: result.games.filter(shown).length,
      visible,
    };
  });

  const games = ALL_LEAGUES.flatMap((league) => {
    const result = loaded[league];
    return result && 'games' in result && !hidden.has(league)
      ? result.games.filter(shown)
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
        onRetry={retry}
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
  const path = `/api/games?${new URLSearchParams({ league, from, to })}`;
  const response = await fetch(path, { signal });
  if (!response.ok) {
    const body: { detail?: string } | null = await response
      .json()
      .catch(() => null);
    const detail = body?.detail ? ` · ${body.detail}` : '';
    throw new Error(`${path} responded ${response.status}${detail}`);
  }
  const data: { games: Game[] } = await response.json();
  return data.games;
}
