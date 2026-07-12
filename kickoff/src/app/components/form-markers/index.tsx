import type { MatchOutcome } from '@/app/types/domain/standings';

export const OUTCOME_LABEL: Record<MatchOutcome, string> = {
  W: 'Vinst',
  D: 'Oavgjort',
  L: 'Förlust',
};

export const OUTCOME_TEXT: Record<MatchOutcome, string> = {
  W: 'text-win',
  D: 'text-draw',
  L: 'text-loss',
};

export const OUTCOME_STYLE: Record<MatchOutcome, string> = {
  W: `bg-win/20 ${OUTCOME_TEXT.W}`,
  D: `bg-draw/20 ${OUTCOME_TEXT.D}`,
  L: `bg-loss/20 ${OUTCOME_TEXT.L}`,
};

type Props = {
  form: MatchOutcome[];
};

/**
 * Last-five form chips. Letters carry the information; colour is a secondary
 * cue, and the full sequence is announced to screen readers.
 */
export function FormMarkers({ form }: Props) {
  const spoken = form.map((o) => OUTCOME_LABEL[o]).join(', ');
  return (
    <span className="inline-flex items-center gap-1">
      <span className="sr-only">Senaste fem matcherna: {spoken}</span>
      {form.map((outcome, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: chips are positional (slot N of the last five); position is their identity
          key={`${i}-${outcome}`}
          aria-hidden="true"
          className={`num flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${OUTCOME_STYLE[outcome]}`}
        >
          {outcome === 'W' ? 'V' : outcome === 'D' ? 'O' : 'F'}
        </span>
      ))}
    </span>
  );
}
