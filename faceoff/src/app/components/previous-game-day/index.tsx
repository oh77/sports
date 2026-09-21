import type React from 'react';
import type { League } from '@/app/types/domain/league';
import type { TeamFormIndex } from '@/app/utils/teamForm';
import type { GameInfo } from '../../types/domain/game';
import { GameGroup } from '../game-group';

interface PreviousGameDayProps {
  games: GameInfo[];
  league: League;
  /** Recent games to read each side's form from. */
  form?: TeamFormIndex;
}

/**
 * A past game day: every game of that day in a single box, under a centered
 * date rule. It borrows the upcoming list's time-group header instead of its
 * left-aligned day header, so a finished day reads as a different thing at a
 * glance.
 */
export const PreviousGameDay: React.FC<PreviousGameDayProps> = ({
  games,
  league,
  form,
}) => {
  if (games.length === 0) return null;

  const byStartTime = [...games].sort(
    (a, b) =>
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );

  return (
    <GameGroup
      label={formatDayLabel(new Date(byStartTime[0].startDateTime))}
      games={byStartTime}
      league={league}
      dense
      form={form}
    />
  );
};

/** Date rule label, e.g. "9 september 2026". */
function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
