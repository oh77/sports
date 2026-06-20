'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CHL_SEASONS } from '@/app/config/chl';
import { STATNET_SEASONS } from '@/app/config/statnet';
import { useSeason } from '@/app/utils/useSeason';

/** Human-friendly label for a season key, e.g. "25-26" -> "2025/26". */
function seasonLabel(key: string): string {
  const [start, end] = key.split('-');
  return start && end ? `20${start}/${end}` : key;
}

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

  // The season list differs by league (CHL has its own seasons).
  const league = pathname.split('/')[1];
  const seasons = league === 'chl' ? CHL_SEASONS : STATNET_SEASONS;

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
        className="flex items-center gap-1 rounded-full bg-gray-800/80 hover:bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors"
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
          <div className="absolute left-1/2 top-full z-50 mt-2 min-w-[140px] -translate-x-1/2 overflow-hidden rounded-lg bg-white py-2 shadow-lg">
            {seasons.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => goTo(s.key)}
                aria-current={s.key === season}
                className={`block w-full px-4 py-2 text-left transition-colors hover:bg-gray-100 ${
                  s.key === season
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-800'
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
