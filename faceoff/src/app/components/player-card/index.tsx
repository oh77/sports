'use client';

import type React from 'react';

interface PlayerCardProps {
  playerName: string;
  playerNumber: number;
  primaryValue: string;
  secondaryValue: string;
  rank: number | null;
  nationality: string;
  club?: string;
}

/**
 * Country flag from the ISO 3166-1 alpha-2 nationality code, via flag-icons.
 * Falls back to a text badge for anything that isn't a two-letter code.
 */
const NationalityFlag: React.FC<{ nationality: string }> = ({
  nationality,
}) => {
  const code = nationality.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) {
    return (
      <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-soft">
        {nationality}
      </span>
    );
  }
  return (
    <span
      className={`fi fi-${code} h-4 w-[22px] rounded-[3px] ring-1 ring-line/60`}
      role="img"
      aria-label={nationality.toUpperCase()}
      title={nationality.toUpperCase()}
    />
  );
};

/** Medal accent for the top three ranks, transparent otherwise. */
const rankAccent = (rank: number | null): string => {
  if (rank === 1) return '#d8a400'; // gold
  if (rank === 2) return '#aab2bd'; // silver
  if (rank === 3) return '#c8803f'; // bronze
  return 'transparent';
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerNumber,
  primaryValue,
  secondaryValue,
  rank,
  nationality,
  club,
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 transition-colors hover:border-line-strong">
    {/* Rank with medal accent bar */}
    <span className="flex w-9 items-center gap-2">
      <span
        className="inline-block h-[18px] w-[3px] rounded-sm"
        style={{ background: rankAccent(rank) }}
        aria-hidden="true"
      />
      {rank != null && (
        <span className="display num text-base font-bold text-ink">{rank}</span>
      )}
    </span>

    {/* Jersey number badge (hidden when unknown, e.g. NHL summary feed) */}
    {playerNumber > 0 && (
      <span className="display num inline-flex h-[26px] min-w-[34px] items-center justify-center rounded-md bg-surface-3 px-1.5 text-[13px] font-bold text-soft">
        #{playerNumber}
      </span>
    )}

    {/* Name + club */}
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
        {playerName}
      </h3>
      {club && <p className="truncate text-xs text-dim">{club}</p>}
    </div>

    {/* Nationality flag */}
    {nationality && <NationalityFlag nationality={nationality} />}

    {/* Stats: primary value with the secondary on a second line */}
    <div className="min-w-[44px] text-right leading-tight">
      <span className="display num block text-xl font-bold text-ink">
        {primaryValue}
      </span>
      <span className="num block text-xs text-dim">{secondaryValue}</span>
    </div>
  </div>
);
