'use client';

import Image from 'next/image';
import type React from 'react';
import { CountryFlag } from '@/app/components/country-flag';
import { StadiumIcon } from '@/app/components/icons/stadium-icon';
import type { League } from '@/app/types/domain/league';
import { formatTimeFromDate } from '@/app/utils/dateUtils';
import { type MeetingTally, meetingTally } from '@/app/utils/teamGames';
import { type RGB, rgba, useDominantColor } from '@/app/utils/useDominantColor';
import type { GameInfo } from '../../types/domain/game';
import type { TeamInfo } from '../../types/domain/team';
import { TrendMarkers } from '../trend-markers';

interface NextGameProps {
  game: GameInfo | null;
  currentTeamCode: string;
  /**
   * The other team. With no meeting left to play, the hero sums up the
   * season's meetings between the two instead of showing a kick-off.
   */
  opponentTeamCode?: string;
  league: League;
  allGames?: GameInfo[];
}

// Neutral slate used until a logo color resolves, or when a logo has none.
const DEFAULT_ACCENT: RGB = { r: 82, g: 98, b: 128 };

const NextGame: React.FC<NextGameProps> = ({
  game,
  currentTeamCode,
  opponentTeamCode,
  allGames = [],
}) => {
  const tally =
    !game && opponentTeamCode
      ? meetingTally(allGames, currentTeamCode, opponentTeamCode)
      : null;
  const home = game ? game.homeTeamInfo.teamInfo : (tally?.team ?? null);
  const away = game ? game.awayTeamInfo.teamInfo : (tally?.opponent ?? null);

  const homeColor = useDominantColor(home?.logo);
  const awayColor = useDominantColor(away?.logo);

  if (!home || !away) {
    return null;
  }

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
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-6 md:gap-6 md:px-10 md:py-10">
          {/* Home */}
          <TeamColumn teamInfo={home} accent={homeAccent} />

          {/* Center */}
          {game ? (
            <KickoffCenter game={game} />
          ) : (
            tally && <TallyCenter tally={tally} />
          )}

          {/* Away */}
          <TeamColumn teamInfo={away} accent={awayAccent} />
        </div>

        {allGames.length > 0 && (
          <div className="relative z-10 border-t border-white/5 px-4 pb-4 pt-4 md:px-8">
            <TrendMarkers
              games={allGames}
              homeTeamCode={home.code}
              awayTeamCode={away.code}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NextGame;

/** Date, time and venue of the coming meeting. */
function KickoffCenter({ game }: { game: GameInfo }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.12em] md:tracking-[0.22em] text-dim md:text-xs">
        {formatDateLabel(game.startDateTime)}
      </p>
      <p className="display num mt-1 text-4xl font-bold leading-none text-ink md:text-6xl">
        {formatTime(game.startDateTime)}
      </p>

      <VsDivider />

      {/* Stacked on phones (icon over name), a pill from md up. */}
      <div className="flex max-w-full flex-col items-center gap-1 text-[10px] text-soft md:flex-row md:gap-1.5 md:rounded-full md:border md:border-line md:px-3 md:py-1.5 md:text-sm">
        <StadiumIcon className="h-4 w-auto shrink-0 text-dim" />
        <span className="min-w-0 max-w-full truncate">
          {game.venueInfo.name}
        </span>
      </div>
    </div>
  );
}

/**
 * The season's meetings summed up for when the two have no meeting left to
 * play: wins for each side, with a draws column between them only when a
 * meeting actually ended level (rare in hockey, decided in overtime).
 */
function TallyCenter({ tally }: { tally: MeetingTally }) {
  const { played, wins, losses, draws, team, opponent } = tally;
  const cells = [
    {
      label: team.code.toUpperCase(),
      title: `Vinster ${team.full}`,
      value: wins,
    },
    ...(draws > 0
      ? [{ label: 'Oavgj.', title: 'Oavgjorda', value: draws }]
      : []),
    {
      label: opponent.code.toUpperCase(),
      title: `Vinster ${opponent.full}`,
      value: losses,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.12em] md:tracking-[0.22em] text-dim md:text-xs">
        Säsongens möten
      </p>
      <dl className="mt-1 flex items-start gap-3 md:gap-5">
        {cells.map((cell) => (
          <div
            key={cell.title}
            className="flex flex-col-reverse items-center gap-1"
          >
            <dt
              title={cell.title}
              className="display text-[10px] font-bold uppercase tracking-[0.08em] text-dim md:text-xs"
            >
              <span aria-hidden="true">{cell.label}</span>
              <span className="sr-only">{cell.title}</span>
            </dt>
            <dd className="display num text-4xl font-bold leading-none text-ink md:text-6xl">
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      <VsDivider />

      <p className="text-[10px] text-soft md:rounded-full md:border md:border-line md:px-3 md:py-1.5 md:text-sm">
        {played} {played === 1 ? 'match' : 'matcher'}
      </p>
    </div>
  );
}

function VsDivider() {
  return (
    <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-mute">
      <span className="h-px w-4 bg-line md:w-8" />
      VS
      <span className="h-px w-4 bg-line md:w-8" />
    </div>
  );
}

function TeamColumn({ teamInfo, accent }: { teamInfo: TeamInfo; accent: RGB }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full md:h-28 md:w-28"
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
            className="h-11 w-11 object-contain md:h-20 md:w-20"
            unoptimized
          />
        ) : (
          <span className="text-2xl text-mute md:text-4xl">🏒</span>
        )}
      </div>

      <p className="display mt-3 max-w-full break-words text-center text-base font-bold uppercase leading-tight tracking-[0.02em] text-ink md:text-2xl">
        <span className="md:hidden">{teamInfo.long || teamInfo.full}</span>
        <span className="hidden md:inline">{teamInfo.full}</span>
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
