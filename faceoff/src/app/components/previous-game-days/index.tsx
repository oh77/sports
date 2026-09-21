'use client';

import type React from 'react';
import { useState } from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamFormIndex } from '@/app/utils/teamForm';
import type { GameInfo } from '../../types/domain/game';
import { PreviousGameDay } from '../previous-game-day';

interface PreviousGameDaysProps {
  previousGameDays: Array<{ date: string; games: GameInfo[] }>;
  league: League;
  /** Recent games to read each side's form from. */
  form?: TeamFormIndex;
}

export const PreviousGameDays: React.FC<PreviousGameDaysProps> = ({
  previousGameDays,
  league,
  form,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8">
      {/* Toggle row, styled like the day headers it reveals. */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="group mb-4 flex w-full items-center gap-3 focus:outline-none"
      >
        <span className="display text-base font-bold uppercase tracking-[0.08em] text-dim transition-colors group-hover:text-ink">
          Tidigare matcher
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-dim transition-transform group-hover:text-ink ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </button>

      {/* Oldest first, so the days flow chronologically into today's list. */}
      {isExpanded &&
        [...previousGameDays]
          .reverse()
          .map((previousDay) => (
            <PreviousGameDay
              key={previousDay.date}
              games={previousDay.games}
              league={league}
              form={form}
            />
          ))}
    </div>
  );
};
