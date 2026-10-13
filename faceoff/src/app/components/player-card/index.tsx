'use client';

import Image from 'next/image';
import type React from 'react';

interface PlayerCardProps {
  playerName: string;
  playerNumber: number;
  primaryValue: string;
  secondaryValue: string;
  rank: number | null;
  nationality: string;
  /** Second line under the name; markup allowed (e.g. the goalie pairs). */
  club?: React.ReactNode;
  /**
   * Club logo, shown in the jersey badge's slot. For rows whose subject is a
   * club rather than a single player (the goalie pairs), where a jersey number
   * would mean nothing.
   */
  logo?: { src: string; alt: string };
  /**
   * Narrow layout for two cards side by side on a phone: below `md` it drops
   * rank and flag, shrinks the number badge, and shows `shortName` instead of
   * the full name.
   */
  compact?: boolean;
  /** Name for the compact phone layout, e.g. the last name. */
  shortName?: string;
  /**
   * A row inside a shared container rather than a card of its own: no border,
   * background or rounding.
   */
  bare?: boolean;
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
  logo,
  compact = false,
  shortName,
  bare = false,
}) => {
  // Classes for the parts a compact card hides on phones.
  const wide = compact ? 'hidden md:inline-flex' : 'inline-flex';
  const showShort = compact && shortName;
  // With no club line the name is a single line, so the secondary value moves
  // to its own line below, keeping number, name and primary value on one row.
  const stacked = !club;
  const secondary = (
    <span className="num block text-right text-xs leading-tight text-dim">
      {secondaryValue}
    </span>
  );

  return (
    <div
      className={`py-2.5 ${bare ? '' : 'rounded-lg border border-line bg-surface transition-colors hover:border-line-strong'} ${compact ? 'px-2.5 md:px-3' : 'px-3'}`}
    >
      <div
        className={`flex items-center ${compact ? 'gap-2 md:gap-3' : 'gap-3'}`}
      >
        {/* Rank with medal accent bar */}
        <span className={`${wide} w-9 items-center gap-2`}>
          <span
            className="inline-block h-[18px] w-[3px] rounded-sm"
            style={{ background: rankAccent(rank) }}
            aria-hidden="true"
          />
          {rank != null && (
            <span className="display num text-base font-bold text-ink">
              {rank}
            </span>
          )}
        </span>

        {/* Club logo, or the jersey number badge (hidden when unknown, e.g. an NHL
        player with no current roster entry) */}
        {logo ? (
          <span
            className={`${wide} h-[26px] w-[34px] items-center justify-center`}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={26}
              height={26}
              className="h-[26px] w-[26px] object-contain"
              unoptimized
            />
          </span>
        ) : (
          playerNumber > 0 && (
            <span
              className={`display num inline-flex h-[26px] shrink-0 items-center justify-center rounded-md bg-surface-3 font-bold text-soft ${compact ? 'min-w-[28px] px-1 text-[12px] md:min-w-[34px] md:px-1.5 md:text-[13px]' : 'min-w-[34px] px-1.5 text-[13px]'}`}
            >
              #{playerNumber}
            </span>
          )
        )}

        {/* Name + club */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            {showShort ? (
              <>
                <span className="md:hidden">{shortName}</span>
                <span className="hidden md:inline">{playerName}</span>
              </>
            ) : (
              playerName
            )}
          </h3>
          {club && <p className="truncate text-xs text-dim">{club}</p>}
        </div>

        {/* Nationality flag */}
        {nationality && (
          <span className={`${wide} items-center`}>
            <NationalityFlag nationality={nationality} />
          </span>
        )}

        {/* Stats: primary value with the secondary on a second line */}
        <div className="min-w-[44px] text-right leading-tight">
          <span
            className={`display num block font-bold text-ink ${compact ? 'text-base md:text-xl' : 'text-xl'}`}
          >
            {primaryValue}
          </span>
          {!stacked && secondary}
        </div>
      </div>
      {stacked && secondary}
    </div>
  );
};
