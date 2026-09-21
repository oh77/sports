import type React from 'react';
import type { GamePhase } from '@/app/types/domain/game';

/** Swedish label per phase. The regular season is the norm and stays unlabelled. */
const PHASE_LABEL: Partial<Record<GamePhase, string>> = {
  preseason: 'Försäsong',
  playoffs: 'Slutspel',
};

interface GamePhaseTagProps {
  phase?: GamePhase;
}

/**
 * Small pill marking a game that is not a regular-season one, so a preseason
 * or playoff fixture is not mistaken for a league game. Renders nothing for
 * regular-season games and for feeds that report no phase at all.
 */
export const GamePhaseTag: React.FC<GamePhaseTagProps> = ({ phase }) => {
  const label = phase ? PHASE_LABEL[phase] : undefined;
  if (!label) return null;

  return (
    <span className="display shrink-0 rounded border border-line-soft px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-mute">
      {label}
    </span>
  );
};
