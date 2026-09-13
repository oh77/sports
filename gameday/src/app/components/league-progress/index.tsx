import type { CSSProperties } from 'react';
import { LeagueBadge } from '@/app/components/league-badge';
import { LEAGUES } from '@/app/config/leagues';
import type { League } from '@/app/types/domain/league';

export type LeagueLoad = {
  league: League;
  state: 'loading' | 'done' | 'failed';
  /** Games this league has in the window (after any filter). */
  count: number;
  /** Whether the league's games are shown in the list. */
  visible: boolean;
};

type Props = {
  leagues: LeagueLoad[];
  onToggle: (league: League) => void;
  onShowAll: () => void;
};

/**
 * Per-league loading status — spinner while pending, then count or failure —
 * doubling as toggles for showing or hiding each league's games.
 */
export function LeagueProgress({ leagues, onToggle, onShowAll }: Props) {
  const total = leagues.length;
  const settled = leagues.filter((l) => l.state !== 'loading').length;
  const failed = leagues.filter((l) => l.state === 'failed').length;
  const anyHidden = leagues.some((l) => !l.visible);

  const allDone = settled === total;
  let summary = `Hämtar ligor · ${settled} av ${total}`;
  let summaryTone = 'text-mute';
  if (allDone && failed > 0) {
    summary = `${failed} av ${total} ligor kunde inte hämtas`;
    summaryTone = 'text-live';
  } else if (allDone) {
    // Success needs no lingering message: fade it out after a moment.
    summary = 'Alla ligor hämtade';
    summaryTone = 'animate-fade-out text-mute';
  }

  return (
    <section aria-labelledby="ligor" className="mb-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="ligor"
          className="display text-sm font-semibold uppercase tracking-[0.08em] text-dim"
        >
          Ligor
          <span className="hidden font-sans text-xs font-normal normal-case tracking-normal text-mute sm:inline">
            {' '}
            · tryck för att visa eller dölja
          </span>
        </h2>
        <div className="flex items-baseline gap-3">
          {anyHidden && (
            <button
              type="button"
              onClick={onShowAll}
              className="cursor-pointer text-xs text-dim underline underline-offset-2 hover:text-ink"
            >
              Visa alla
            </button>
          )}
          <p role="status" className={`num text-xs ${summaryTone}`}>
            {summary}
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mb-3 h-0.5 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${(settled / total) * 100}%` }}
        />
      </div>
      <ul className="flex flex-wrap gap-2">
        {leagues.map((load) => (
          <li key={load.league}>
            <LeagueChip {...load} onToggle={onToggle} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeagueChip({
  league,
  state,
  count,
  visible,
  onToggle,
}: LeagueLoad & { onToggle: (league: League) => void }) {
  const meta = LEAGUES[league];
  const tone = !visible
    ? 'border-dashed border-line-strong bg-transparent opacity-45 grayscale'
    : {
        loading: 'border-line bg-surface',
        done: 'border-accent/40 bg-accent/[0.07]',
        failed: 'border-live/50 bg-live/10',
      }[state];

  return (
    <button
      type="button"
      aria-pressed={visible}
      title={`${visible ? 'Dölj' : 'Visa'} ${meta.name}`}
      onClick={() => onToggle(league)}
      style={{ '--accent': meta.accent } as CSSProperties}
      className={`flex cursor-pointer items-center gap-2 rounded-lg border py-1 pr-2.5 pl-1 text-sm transition duration-300 hover:border-accent hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${tone}`}
    >
      <LeagueBadge league={league} />
      {state === 'loading' && (
        <>
          <span
            aria-hidden="true"
            className="block h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent motion-reduce:animate-none"
          />
          <span className="sr-only">hämtas</span>
        </>
      )}
      {state === 'done' && (
        <span
          className={`num display animate-pop min-w-4 text-center font-bold motion-reduce:animate-none ${
            count > 0 ? 'text-ink' : 'text-mute'
          }`}
        >
          {count}
          <span className="sr-only"> matcher</span>
        </span>
      )}
      {state === 'failed' && (
        <span className="min-w-4 text-center font-bold text-live">
          <span aria-hidden="true">✕</span>
          <span className="sr-only">kunde inte hämtas</span>
        </span>
      )}
    </button>
  );
}
