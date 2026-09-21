import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamFormIndex } from '@/app/utils/teamForm';
import type { GameInfo } from '../../types/domain/game';
import { GameContainer } from '../game-container';

interface GameGroupProps {
  /** Centered header above the box — the shared start time, or a day's date. */
  label?: string;
  games: GameInfo[];
  league: League;
  /** Tighter rows, used for previous game days. */
  dense?: boolean;
  /** Recent games to read each side's form from, passed on to every row. */
  form?: TeamFormIndex;
}

export const GameGroup: React.FC<GameGroupProps> = ({
  label,
  games,
  league,
  dense = false,
  form,
}) => (
  <div className={dense ? 'mb-4' : 'mb-6'}>
    {label && (
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <h2 className="display num text-sm font-bold uppercase tracking-[0.08em] text-dim">
          {label}
        </h2>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
    )}

    <div className="rounded-lg border border-line bg-surface divide-y divide-line-soft">
      {games.map((game, index) => (
        <GameContainer
          key={game.uuid || index}
          game={game}
          league={league}
          variant={dense ? 'dense' : 'row'}
          form={form}
        />
      ))}
    </div>
  </div>
);
