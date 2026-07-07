'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SeasonSwitcher } from '@/app/components/season-switcher';
import { ALL_LEAGUES } from '@/app/config/leagues';
import { leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import {
  leagueBasePath,
  standingsPath,
  statsPath,
} from '@/app/utils/leaguePaths';

type Section = 'matcher' | 'tabell' | 'statistik';

interface TopNavProps {
  league: League;
  season?: string;
}

/** Derive the active nav section from the path segment after the season. */
function activeSection(pathname: string): Section | null {
  // /<league>/<season>/<seg>/...
  const seg = pathname.split('/')[3] ?? '';
  if (seg === 'standings') return 'tabell';
  if (seg === 'stats') return 'statistik';
  if (seg === '') return 'matcher';
  return null; // individual team pages have no section tab
}

export function TopNav({ league, season }: TopNavProps) {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const items: { id: Section; label: string; href: string }[] = [
    { id: 'matcher', label: 'Matcher', href: leagueBasePath(league, season) },
    { id: 'tabell', label: 'Tabell', href: standingsPath(league, season) },
    { id: 'statistik', label: 'Statistik', href: statsPath(league, season) },
  ];

  const { name, short } = leagueMeta[league];

  return (
    <header className="sticky top-0 z-30 border-b border-line-strong bg-bg/95 backdrop-blur">
      <div className="relative mx-auto flex h-[60px] max-w-7xl items-center px-4 md:px-6">
        {/* League badge + name (opens league switcher) */}
        <div className="relative pr-4 md:pr-8">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Byt liga"
          >
            <span
              aria-hidden="true"
              className="display flex h-8 w-8 items-center justify-center rounded-md bg-surface text-[11px] font-bold uppercase tracking-wide text-accent"
            >
              {short}
            </span>
            <span className="display text-[17px] font-bold uppercase tracking-[0.1em] text-ink">
              {name}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 text-mute transition-transform ${menuOpen ? 'rotate-180' : ''}`}
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

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
                onClick={() => setMenuOpen(false)}
                aria-label="Stäng ligameny"
              />
              <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-line bg-surface py-1.5 shadow-2xl">
                <div className="display px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
                  Byt liga
                </div>
                {ALL_LEAGUES.filter((l) => l !== league).map((l) => (
                  <Link
                    key={l}
                    href={leagueBasePath(l)}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-soft transition-colors hover:bg-surface-3 hover:text-ink"
                  >
                    {leagueMeta[l].name}
                  </Link>
                ))}
                <div className="my-1 border-t border-line" />
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-soft transition-colors hover:bg-surface-3 hover:text-ink"
                >
                  Hem
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Section tabs (desktop) */}
        <nav
          className="hidden h-full items-stretch md:flex"
          aria-label="Sektioner"
        >
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`display flex h-full items-center border-b-[3px] px-4 text-[14px] font-bold uppercase tracking-[0.08em] transition-colors ${
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-mute hover:text-soft'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <SeasonSwitcher />

        {/* Mobile section menu (hamburger), centered in the bar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-surface text-soft transition-colors hover:text-ink"
            aria-haspopup="menu"
            aria-expanded={navOpen}
            aria-label="Sektionsmeny"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {navOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          {navOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
                onClick={() => setNavOpen(false)}
                aria-label="Stäng meny"
              />
              <div className="absolute left-1/2 top-full z-50 mt-2 min-w-[180px] -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-surface py-1.5 text-center shadow-2xl">
                {items.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`display block px-4 py-2.5 text-sm font-bold uppercase tracking-[0.06em] transition-colors ${
                        isActive
                          ? 'text-accent'
                          : 'text-soft hover:bg-surface-3 hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
