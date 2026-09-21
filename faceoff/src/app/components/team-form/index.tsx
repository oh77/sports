import type React from 'react';
import type { FormResult, TeamFormEntry } from '@/app/utils/teamForm';

const RESULT_CLASS: Record<FormResult, string> = {
  win: 'bg-win',
  'win-ot': 'bg-win/60',
  loss: 'bg-loss',
  'loss-ot': 'bg-loss/60',
  // Neutral — a drawn CHL playoff leg is neither side's result.
  draw: 'bg-dim',
};

/** Spoken result, so the markers are not colour-only. */
const RESULT_LABEL: Record<FormResult, string> = {
  win: 'vinst',
  'win-ot': 'vinst efter förlängning',
  loss: 'förlust',
  'loss-ot': 'förlust efter förlängning',
  draw: 'oavgjort',
};

/** sm — the row under a logo in a game listing; md — the next-game trend. */
export type TeamFormSize = 'sm' | 'md';

const SIZE_CLASS: Record<TeamFormSize, { dot: string; gap: string }> = {
  sm: { dot: 'h-2 w-2', gap: 'gap-1' },
  md: { dot: 'h-3 w-3', gap: 'gap-1.5' },
};

interface TeamFormProps {
  /** Recent results, oldest first — as `TeamFormIndex.formFor` returns them. */
  entries: TeamFormEntry[];
  size?: TeamFormSize;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/**
 * A team's recent form as a row of coloured markers, oldest to newest. Each
 * marker carries the result on hover; the row as a whole is labelled for
 * screen readers, which cannot read the colours.
 */
export const TeamForm: React.FC<TeamFormProps> = ({
  entries,
  size = 'sm',
  align = 'center',
  className = '',
}) => {
  const { dot, gap } = SIZE_CLASS[size];
  const justify =
    align === 'start'
      ? 'justify-start'
      : align === 'end'
        ? 'justify-end'
        : 'justify-center';

  if (entries.length === 0) {
    // Keeps a formless team's logo level with its opponent's in a listing row.
    return <div className={`${dot} ${className}`} aria-hidden="true" />;
  }

  return (
    <div
      className={`flex items-center ${gap} ${justify} ${className}`}
      role="img"
      aria-label={`Form, äldsta först: ${entries
        .map((entry) => RESULT_LABEL[entry.result])
        .join(', ')}`}
    >
      {entries.map((entry) => (
        <span
          key={entry.uuid}
          className={`${dot} rounded-md ${RESULT_CLASS[entry.result]}`}
          title={`${entry.opponent} (${entry.location}) ${entry.teamScore}–${entry.opponentScore}`}
        />
      ))}
    </div>
  );
};
