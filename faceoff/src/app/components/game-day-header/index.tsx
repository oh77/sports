import type React from 'react';
import { GamePhaseTag } from '@/app/components/game-phase-tag';
import type { GamePhase } from '@/app/types/domain/game';

interface GameDayHeaderProps {
  /** Any date that falls on the game day (e.g. the first game's start time). */
  date: Date;
  /** The day's season phase. Tagged when it isn't the regular season. */
  phase?: GamePhase;
}

/**
 * NHL-style day/date header for game listings on league landing pages.
 * Renders a left-aligned row: a condensed uppercase relative label, a muted
 * full date, a tag for a non-regular-season day, and a divider rule, e.g.
 *
 *   IDAG  20 december ────────────────
 */
export const GameDayHeader: React.FC<GameDayHeaderProps> = ({
  date,
  phase,
}) => (
  <h2 className="mb-3 flex items-center gap-3">
    <span className="display text-base font-bold uppercase tracking-[0.08em] text-ink">
      {dayLabel(date)}
    </span>
    <span className="text-sm font-semibold uppercase tracking-[0.04em] text-dim">
      {formatDate(date)}
    </span>
    <GamePhaseTag phase={phase} />
    <span className="h-px flex-1 bg-line" aria-hidden="true" />
  </h2>
);

/** Start-of-day timestamp for a date. */
function startOfDay(date: Date): number {
  return new Date(date.toDateString()).getTime();
}

/** Relative day label — IDAG / IMORGON, otherwise the short weekday (e.g. TIS). */
function dayLabel(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const oneDay = 24 * 60 * 60 * 1000;
  if (target === today) return 'IDAG';
  if (target === today + oneDay) return 'IMORGON';
  return date
    .toLocaleDateString('sv-SE', { weekday: 'short' })
    .replace(/\.$/, '')
    .toUpperCase();
}

/**
 * Date with full month, no weekday, e.g. "20 december" — with the year when it
 * isn't the current one, as on past-season pages.
 */
function formatDate(date: Date): string {
  const showYear = date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    ...(showYear ? { year: 'numeric' } : {}),
  });
}
