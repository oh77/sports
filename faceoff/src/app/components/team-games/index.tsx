'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { GamePhaseTag } from '@/app/components/game-phase-tag';
import { ScoreOrStatus } from '@/app/components/team-games/scoreOrStatus';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import {
  formatShortDateFromString,
  isDateTimePassed,
} from '@/app/utils/dateUtils';
import { vsPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';

interface TeamGamesProps {
  games: GameInfo[];
  /** The team the list is about; rows show its opponent. */
  currentTeamCode: string;
  league: League;
  /** previous — rows carry the result; upcoming — rows carry the date. */
  kind: 'previous' | 'upcoming';
  title: string;
  headingLevel?: 'h2' | 'h3';
}

/**
 * One team's games as a compact list: home/away marker, opponent and either
 * the result or the date, one line per game. The opponent links on to the
 * matchup page for the two teams.
 */
export const TeamGames: React.FC<TeamGamesProps> = ({
  games,
  currentTeamCode,
  league,
  kind,
  title,
  headingLevel: Heading = 'h2',
}) => {
  const season = useSeason();

  return (
    <section>
      <Heading
        className={`display mb-2 font-bold uppercase tracking-[0.08em] ${
          Heading === 'h2' ? 'text-lg text-ink' : 'text-[13px] text-dim'
        }`}
      >
        {title}
      </Heading>
      {games.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-3 py-3 text-center text-sm text-dim">
          {kind === 'previous'
            ? 'Inga spelade matcher'
            : 'Inga kommande matcher'}
        </p>
      ) : (
        <ul className="rounded-lg border border-line bg-surface divide-y divide-line-soft">
          {games.map((game) => {
            const isHomeTeam =
              game.homeTeamInfo.teamInfo.code === currentTeamCode;
            const opponent = isHomeTeam
              ? game.awayTeamInfo.teamInfo
              : game.homeTeamInfo.teamInfo;

            return (
              <li key={game.uuid} className="flex items-center gap-2 px-3 py-2">
                <SideChip home={isHomeTeam} />
                <Link
                  href={vsPath(league, season, currentTeamCode, opponent.code)}
                  title={opponent.full}
                  className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3">
                    {opponent.logo ? (
                      <Image
                        src={opponent.logo}
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                        unoptimized
                      />
                    ) : (
                      <span aria-hidden="true" className="text-[9px] text-mute">
                        {opponent.code}
                      </span>
                    )}
                  </span>
                  <span className="truncate">
                    <span className="hidden sm:inline">{opponent.long}</span>
                    <span className="sm:hidden">{opponent.short}</span>
                  </span>
                </Link>
                <GamePhaseTag phase={game.phase} />
                <span className="ml-auto shrink-0 text-right">
                  {kind === 'previous' ? (
                    <ScoreOrStatus gameInfo={game} isHomeTeam={isHomeTeam} />
                  ) : (
                    <UpcomingLabel game={game} />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

/** The date of a coming game, or a live marker once it has started. */
function UpcomingLabel({ game }: { game: GameInfo }) {
  const started =
    game.state === 'live' || isDateTimePassed(new Date(game.startDateTime));

  if (started) {
    return (
      <span className="inline-flex items-center text-sm text-dim">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-otl" />
        Pågående
      </span>
    );
  }

  return (
    <span className="num text-sm text-soft">
      {formatShortDateFromString(game.startDateTime).replace('.', '')}
    </span>
  );
}

/** Hemma/Borta marker — a letter on screen, the full word for screen readers. */
function SideChip({ home }: { home: boolean }) {
  return (
    <span
      title={home ? 'Hemmamatch' : 'Bortamatch'}
      className="display flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-3 text-[10px] font-bold uppercase text-soft"
    >
      <span aria-hidden="true">{home ? 'H' : 'B'}</span>
      <span className="sr-only">{home ? 'Hemma' : 'Borta'}</span>
    </span>
  );
}
