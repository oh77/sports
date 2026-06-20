'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';

type LeagueGame = { league: League; game: GameInfo };

const LEAGUE_CHIP: Record<League, { bg: string; logo: string; label: string }> =
  {
    shl: {
      bg: 'rgba(24,29,38,1)',
      logo: 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg',
      label: 'SHL',
    },
    sdhl: {
      bg: 'rgba(50,0,208,1)',
      logo: 'https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg',
      label: 'SDHL',
    },
    ha: {
      bg: 'rgba(30,41,59,1)',
      logo: 'https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg',
      label: 'HA',
    },
    chl: {
      bg: '#20001c',
      logo: 'https://www.chl.hockey/static/img/logo.png',
      label: 'CHL',
    },
  };

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('sv-SE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = d.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
}

export function UpcomingAllLeagues({ limit = 10 }: { limit?: number }) {
  const [games, setGames] = useState<LeagueGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/upcoming?limit=${limit}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        if (active) setGames(data.games || []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => i).map((i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || games.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm py-4">
        Inga kommande matcher tillgängliga
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {games.map(({ league, game }) => {
        const chip = LEAGUE_CHIP[league];
        const home = game.homeTeamInfo.teamInfo;
        const away = game.awayTeamInfo.teamInfo;
        return (
          <li
            key={`${league}-${game.uuid}`}
            className="flex items-center gap-3 px-3 py-2.5"
          >
            {/* League */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: chip.bg }}
              title={chip.label}
            >
              <Image
                src={chip.logo}
                alt={chip.label}
                width={24}
                height={24}
                className="h-5 w-5 object-contain"
              />
            </div>

            {/* Teams */}
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-800">
              <TeamCell logo={home.logo} name={home.short} />
              <span className="text-gray-400">–</span>
              <TeamCell logo={away.logo} name={away.short} alignRight />
            </div>

            {/* When */}
            <div className="shrink-0 text-xs font-medium text-gray-500 tabular-nums">
              {formatWhen(game.startDateTime)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TeamCell({
  logo,
  name,
  alignRight = false,
}: {
  logo?: string;
  name: string;
  alignRight?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 ${
        alignRight ? 'justify-start' : 'justify-end'
      }`}
    >
      {alignRight && logo && <TeamLogo logo={logo} name={name} />}
      <span className="truncate">{name}</span>
      {!alignRight && logo && <TeamLogo logo={logo} name={name} />}
    </div>
  );
}

function TeamLogo({ logo, name }: { logo: string; name: string }) {
  return (
    <Image
      src={logo}
      alt={name}
      width={20}
      height={20}
      className="h-5 w-5 shrink-0 object-contain"
    />
  );
}
