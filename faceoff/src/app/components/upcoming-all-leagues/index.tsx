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
    nhl: {
      bg: 'rgba(17,19,25,1)',
      logo: 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg',
      label: 'NHL',
    },
  };

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateKey(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE');
}

function formatDateHeader(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
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
          <div key={i} className="h-12 rounded-lg bg-surface-3 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || games.length === 0) {
    return (
      <p className="text-center text-dim text-sm py-4">
        Inga kommande matcher tillgängliga
      </p>
    );
  }

  const groups: { key: string; label: string; games: LeagueGame[] }[] = [];
  for (const item of games) {
    const key = dateKey(item.game.startDateTime);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.games.push(item);
    } else {
      groups.push({
        key,
        label: formatDateHeader(item.game.startDateTime),
        games: [item],
      });
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="display mb-2 border-b border-line-soft pb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-mute">
            {group.label}
          </h3>
          <ul className="divide-y divide-line-soft rounded-lg border border-line bg-surface overflow-hidden">
            {group.games.map(({ league, game }) => {
              const chip = LEAGUE_CHIP[league];
              const home = game.homeTeamInfo.teamInfo;
              const away = game.awayTeamInfo.teamInfo;
              return (
                <li
                  key={`${league}-${game.uuid}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03]"
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
                  <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink">
                    <TeamCell
                      logo={home.logo}
                      short={home.short}
                      full={home.full}
                    />
                    <span className="text-mute">–</span>
                    <TeamCell
                      logo={away.logo}
                      short={away.short}
                      full={away.full}
                      alignRight
                    />
                  </div>

                  {/* When */}
                  <div className="num shrink-0 text-xs font-medium text-dim tabular-nums">
                    {formatTime(game.startDateTime)}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TeamCell({
  logo,
  short,
  full,
  alignRight = false,
}: {
  logo?: string;
  short: string;
  full: string;
  alignRight?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 ${
        alignRight ? 'justify-start' : 'justify-end'
      }`}
    >
      {alignRight && logo && <TeamLogo logo={logo} name={short} />}
      <span className="truncate">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{full}</span>
      </span>
      {!alignRight && logo && <TeamLogo logo={logo} name={short} />}
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
