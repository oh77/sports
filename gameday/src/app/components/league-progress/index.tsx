import { type CSSProperties, useState } from 'react';
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
  /** Log line of the failure, when `state` is `'failed'`. */
  error?: string;
};

type Props = {
  leagues: LeagueLoad[];
  onToggle: (league: League) => void;
  onShowAll: () => void;
  onRetry: (leagues: League[]) => void;
};

/**
 * Per-league loading status — spinner while pending, then count or failure —
 * doubling as toggles for showing or hiding each league's games.
 */
export function LeagueProgress({
  leagues,
  onToggle,
  onShowAll,
  onRetry,
}: Props) {
  const total = leagues.length;
  const settled = leagues.filter((l) => l.state !== 'loading').length;
  const failures = leagues.filter((l) => l.state === 'failed');
  const failed = failures.length;
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
      {failed > 0 && <LoadErrors failures={failures} onRetry={onRetry} />}
    </section>
  );
}

/** Failed leagues with an expandable log line each, retryable. */
function LoadErrors({
  failures,
  onRetry,
}: {
  failures: LeagueLoad[];
  onRetry: (leagues: League[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const retryButton =
    'cursor-pointer rounded-md border border-line-strong px-2 py-0.5 text-xs font-semibold text-soft transition-colors hover:border-accent hover:text-ink';

  return (
    <div className="mt-3 rounded-lg border border-live/50 bg-live/10 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-1.5 text-soft hover:text-ink"
        >
          <span
            aria-hidden="true"
            className={`inline-block transition-transform motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
          >
            ▸
          </span>
          {open ? 'Dölj logg' : 'Visa logg'}
        </button>
        <button
          type="button"
          onClick={() => onRetry(failures.map((f) => f.league))}
          className={retryButton}
        >
          {failures.length > 1 ? 'Försök igen med alla' : 'Försök igen'}
        </button>
      </div>
      {open && (
        <ul className="mt-2 space-y-2 border-t border-live/30 pt-2">
          {failures.map(({ league, error }) => (
            <li key={league} className="flex items-start gap-2">
              <LeagueBadge league={league} />
              <code className="min-w-0 flex-1 break-all pt-0.5 text-xs text-soft">
                {error}
              </code>
              {failures.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRetry([league])}
                  className={retryButton}
                >
                  Försök igen
                  <span className="sr-only"> med {LEAGUES[league].name}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
