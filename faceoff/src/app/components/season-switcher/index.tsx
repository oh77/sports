'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CHL_SEASONS } from '@/app/config/chl';
import { NHL_SEASONS } from '@/app/config/nhl';
import { STATNET_SEASONS } from '@/app/config/statnet';
import { seasonLabel } from '@/app/utils/seasonLabel';
import { useSeason } from '@/app/utils/useSeason';

/**
 * Dropdown for switching the active season. Keeps the current sub-path (e.g.
 * `/standings`) and swaps only the season segment. Renders nothing if there is
 * no season in the route (e.g. CHL).
 */
export function SeasonSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const season = useSeason();
  const [open, setOpen] = useState(false);

  if (!season) return null;

  // The season list differs by league (CHL and NHL have their own seasons).
  const league = pathname.split('/')[1];
  const seasons =
    league === 'chl'
      ? CHL_SEASONS
      : league === 'nhl'
        ? NHL_SEASONS
        : STATNET_SEASONS;

  const goTo = (key: string) => {
    setOpen(false);
    if (key === season) return;
    // pathname: /<league>/<season>/<...rest> — swap the season segment in place.
    const parts = pathname.split('/');
    parts[2] = key;
    router.push(parts.join('/'));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-soft transition-colors hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Byt säsong"
      >
        {seasonLabel(season)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 border-0 bg-transparent p-0"
            onClick={() => setOpen(false)}
            aria-label="Stäng säsongsmeny"
          />
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-lg border border-line bg-surface py-1.5 shadow-2xl">
            {seasons.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => goTo(s.key)}
                aria-current={s.key === season}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-surface-3 ${
                  s.key === season
                    ? 'font-semibold text-accent'
                    : 'text-soft hover:text-ink'
                }`}
              >
                {seasonLabel(s.key)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
