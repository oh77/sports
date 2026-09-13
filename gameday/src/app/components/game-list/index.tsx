import Image from 'next/image';
import type { CSSProperties } from 'react';
import { LeagueBadge } from '@/app/components/league-badge';
import { LEAGUES } from '@/app/config/leagues';
import type { Game, GameTeam } from '@/app/types/domain/game';
import {
  dateKeyFromString,
  formatDayLabel,
  formatTimeFromString,
} from '@/app/utils/dateUtils';
import { favoriteSides } from '@/app/utils/favorites';

type Props = {
  /** Chronological games. */
  games: Game[];
  /**
   * Day keys to render, in order; days without games get `emptyText`.
   * Defaults to the days the games fall on.
   */
  days?: string[];
  emptyText?: string;
  /** Slide in and briefly highlight rows as they mount (progressive loading). */
  animateIn?: boolean;
};

/** Games grouped under Swedish-local day headings, favorites highlighted. */
export function GameList({
  games,
  days,
  emptyText = 'Inga matcher',
  animateIn = false,
}: Props) {
  const byDay = new Map<string, Game[]>();
  for (const game of games) {
    const day = dateKeyFromString(game.startDateTime);
    const list = byDay.get(day);
    if (list) list.push(game);
    else byDay.set(day, [game]);
  }
  const dayKeys = days ?? [...byDay.keys()];

  if (dayKeys.length === 0) {
    return <p className="py-4 text-center text-sm text-dim">{emptyText}</p>;
  }

  return (
    <div className="space-y-8">
      {dayKeys.map((day) => {
        const dayGames = byDay.get(day) ?? [];
        return (
          <section key={day} aria-labelledby={`dag-${day}`}>
            <h2
              id={`dag-${day}`}
              className="display mb-2 border-b border-line-soft pb-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-dim"
            >
              {formatDayLabel(day)}
            </h2>
            {dayGames.length === 0 ? (
              <p className="py-3 text-sm text-mute">{emptyText}</p>
            ) : (
              <ul className="divide-y divide-line-soft overflow-hidden rounded-lg border border-line bg-surface">
                {dayGames.map((game) => (
                  <GameRow
                    key={`${game.league}-${game.id}`}
                    game={game}
                    animateIn={animateIn}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function GameRow({ game, animateIn }: { game: Game; animateIn: boolean }) {
  const favorite = favoriteSides(game);
  const isFavorite = favorite.home || favorite.away;

  return (
    <li
      style={{ '--accent': LEAGUES[game.league].accent } as CSSProperties}
      className={`grid grid-cols-[2rem_minmax(0,1fr)_4rem_minmax(0,1fr)_1rem] items-center gap-2 px-3 py-2.5 sm:gap-3 ${
        isFavorite
          ? 'bg-accent/[0.07] shadow-[inset_3px_0_0_var(--accent)]'
          : ''
      } ${animateIn ? 'animate-row-in motion-reduce:animate-none' : ''}`}
    >
      <LeagueBadge league={game.league} />
      <TeamCell team={game.home} favorite={favorite.home} side="home" />
      <div className="text-center">
        {game.state === 'not-started' ? (
          <time
            dateTime={game.startDateTime}
            className="num text-sm font-semibold text-soft"
          >
            {formatTimeFromString(game.startDateTime)}
          </time>
        ) : (
          <>
            <span className="num display block text-base font-bold leading-tight text-ink">
              {game.home.score}–{game.away.score}
            </span>
            <span
              className={`block text-[10px] font-semibold uppercase tracking-wider ${
                game.state === 'live' ? 'text-live' : 'text-mute'
              }`}
            >
              {game.state === 'live' ? 'Live' : 'Slut'}
            </span>
          </>
        )}
      </div>
      <TeamCell team={game.away} favorite={favorite.away} side="away" />
      <span className="text-center text-accent">
        {isFavorite && (
          <>
            <span aria-hidden="true">★</span>
            <span className="sr-only">Favoritlag</span>
          </>
        )}
      </span>
    </li>
  );
}

function TeamCell({
  team,
  favorite,
  side,
}: {
  team: GameTeam;
  favorite: boolean;
  side: 'home' | 'away';
}) {
  const logo = team.logo && (
    <Image
      src={team.logo}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className="h-5 w-5 shrink-0 object-contain"
    />
  );
  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 text-sm ${
        side === 'home' ? 'justify-end text-right' : 'justify-start'
      } ${favorite ? 'font-semibold text-ink' : 'text-soft'}`}
    >
      {side === 'away' && logo}
      <span className="truncate">
        <span className="sm:hidden">{team.short}</span>
        <span className="hidden sm:inline">{team.name}</span>
      </span>
      {side === 'home' && logo}
    </div>
  );
}
