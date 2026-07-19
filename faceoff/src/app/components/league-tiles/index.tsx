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
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {LEAGUES.map((league) => {
        const iso = next?.[league.league] ?? null;
        return (
          <Link
            key={league.href}
            href={league.href}
            className="group inline-block"
          >
            <div
              className="flex h-36 w-36 items-center justify-center rounded-xl border border-line p-4 transition-all group-hover:scale-[1.03] group-hover:border-line-strong md:h-44 md:w-44"
              style={{ backgroundColor: league.bg }}
            >
              <Image
                src={league.logo}
                alt={`${league.name} Logo`}
                width={300}
                height={300}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="num mt-2 min-h-[1rem] text-center text-xs font-medium text-dim tabular-nums">
              {iso ? formatNextDate(iso) : ''}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
