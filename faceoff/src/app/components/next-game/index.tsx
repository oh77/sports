'use client';

import Image from 'next/image';
import type React from 'react';
import { CountryFlag } from '@/app/components/country-flag';
import { StadiumIcon } from '@/app/components/icons/stadium-icon';
import type { League } from '@/app/types/domain/league';
import { formatTimeFromDate } from '@/app/utils/dateUtils';
import { type RGB, rgba, useDominantColor } from '@/app/utils/useDominantColor';
import type { GameInfo, GameTeamInfo } from '../../types/domain/game';
import { TrendMarkers } from '../trend-markers';

interface NextGameProps {
  game: GameInfo | null;
  currentTeamCode: string;
  league: League;
  allGames?: GameInfo[];
}

// Neutral slate used until a logo color resolves, or when a logo has none.
const DEFAULT_ACCENT: RGB = { r: 82, g: 98, b: 128 };

const NextGame: React.FC<NextGameProps> = ({ game, allGames = [] }) => {
  const homeColor = useDominantColor(game?.homeTeamInfo.teamInfo.logo);
  const awayColor = useDominantColor(game?.awayTeamInfo.teamInfo.logo);

  if (!game) {
    return null;
  }

  const home = game.homeTeamInfo;
  const away = game.awayTeamInfo;
  const homeAccent = homeColor ?? DEFAULT_ACCENT;
  const awayAccent = awayColor ?? DEFAULT_ACCENT;

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/5"
        style={{
          background: [
            `radial-gradient(80% 130% at 0% 50%, ${rgba(homeAccent, 0.5)} 0%, ${rgba(homeAccent, 0.12)} 32%, transparent 60%)`,
            `radial-gradient(80% 130% at 100% 50%, ${rgba(awayAccent, 0.5)} 0%, ${rgba(awayAccent, 0.12)} 32%, transparent 60%)`,
            'linear-gradient(180deg, #0d1119, #090c12)',
          ].join(', '),
        }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-8 md:gap-6 md:px-10 md:py-10">
          {/* Home */}
          <TeamColumn team={home} accent={homeAccent} />

          {/* Center */}
          <div className="flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-dim md:text-xs">
              {formatDateLabel(game.startDateTime)}
            </p>
            <p className="display num mt-1 text-5xl font-bold leading-none text-ink md:text-6xl">
              {formatTime(game.startDateTime)}
            </p>

            <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-mute">
              <span className="h-px w-8 bg-line" />
              VS
              <span className="h-px w-8 bg-line" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-soft">
              <StadiumIcon className="h-4 w-auto text-dim" />
              <span className="truncate">{game.venueInfo.name}</span>
            </div>
          </div>

          {/* Away */}
          <TeamColumn team={away} accent={awayAccent} />
        </div>

        {allGames.length > 0 && (
          <div className="relative z-10 border-t border-white/5 px-4 pb-4 pt-4 md:px-8">
            <TrendMarkers
              games={allGames}
              homeTeamCode={home.teamInfo.code}
              awayTeamCode={away.teamInfo.code}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NextGame;

function TeamColumn({ team, accent }: { team: GameTeamInfo; accent: RGB }) {
  const { teamInfo } = team;
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full md:h-28 md:w-28"
        style={{
          backgroundColor: rgba(accent, 0.14),
          border: `1px solid ${rgba(accent, 0.3)}`,
          boxShadow: `0 0 45px ${rgba(accent, 0.35)}`,
        }}
      >
        {teamInfo.logo ? (
          <Image
            src={teamInfo.logo}
            alt={`${teamInfo.full} logo`}
            width={112}
            height={112}
            className="h-16 w-16 object-contain md:h-20 md:w-20"
          />
        ) : (
          <span className="text-4xl text-mute">🏒</span>
        )}
      </div>

      <p className="display mt-3 text-center text-lg font-bold uppercase tracking-[0.02em] text-ink md:text-2xl">
        {teamInfo.full}
      </p>
      {teamInfo.country && (
        <CountryFlag country={teamInfo.country} className="mt-2 h-4 w-[26px]" />
      )}
    </div>
  );
}

function formatTime(dateTimeStr: string): string {
  try {
    return formatTimeFromDate(new Date(dateTimeStr));
  } catch {
    return dateTimeStr;
  }
}

/** e.g. "TOR · 3 SEP 2026". */
function formatDateLabel(dateTimeStr: string): string {
  try {
    const date = new Date(dateTimeStr);
    const clean = (s: string) => s.replace('.', '').toUpperCase();
    const weekday = clean(
      date.toLocaleDateString('sv-SE', { weekday: 'short' }),
    ).slice(0, 3);
    const day = date.toLocaleDateString('sv-SE', { day: 'numeric' });
    const month = clean(date.toLocaleDateString('sv-SE', { month: 'short' }));
    return `${weekday} · ${day} ${month} ${date.getFullYear()}`;
  } catch {
    return dateTimeStr;
  }
}
