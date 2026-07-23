'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { League } from '@/app/types/domain/league';

type LeagueTile = {
  league: League;
  href: string;
  bg: string;
  logo: string;
  name: string;
};

const LEAGUES: LeagueTile[] = [
  {
    league: 'shl',
    href: '/shl',
    bg: 'rgba(24,29,38,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg',
    name: 'SHL',
  },
  {
    league: 'sdhl',
    href: '/sdhl',
    bg: 'rgba(50,0,208,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg',
    name: 'SDHL',
  },
  {
    league: 'ha',
    href: '/ha',
    bg: 'rgba(30,41,59,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg',
    name: 'Hockeyallsvenskan',
  },
  {
    league: 'chl',
    href: '/chl',
    bg: '#20001c',
    logo: 'https://www.chl.hockey/static/img/logo.png',
    name: 'CHL',
  },
  {
    league: 'nhl',
    href: '/nhl',
    bg: 'rgba(17,19,25,1)',
    logo: 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg',
    name: 'NHL',
  },
];

function formatNextDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function LeagueTiles() {
  const [next, setNext] = useState<Record<League, string | null> | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/next-games')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        if (active) setNext(data.next ?? null);
      })
      .catch(() => {
        if (active) setNext(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-lg grid-cols-3 gap-3 md:gap-4">
      {LEAGUES.map((league) => {
        const iso = next?.[league.league] ?? null;
        return (
          <Link key={league.href} href={league.href} className="group block">
            <div
              className="flex aspect-square flex-col overflow-hidden rounded-xl border border-line transition-all group-hover:scale-[1.03] group-hover:border-line-strong"
              style={{ backgroundColor: league.bg }}
            >
              {/* Logo */}
              <div className="flex min-h-0 flex-1 items-center justify-center p-4">
                <Image
                  src={league.logo}
                  alt={`${league.name} Logo`}
                  width={300}
                  height={300}
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Next game date, integrated as a footer strip */}
              <div className="shrink-0 border-t border-white/10 bg-black/25 px-2 py-1.5 text-center">
                <span className="num text-[11px] font-medium tabular-nums text-white/70">
                  {iso ? formatNextDate(iso) : '–'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
