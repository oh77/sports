import type React from 'react';
import ClickableTeamLogo from '@/app/components/game-container/ClickableTeamLogo';
import { StadiumIcon } from '@/app/components/icons/stadium-icon';
import { TeamForm } from '@/app/components/team-form';
import type { League } from '@/app/types/domain/league';
import { isDateTimePassed } from '@/app/utils/dateUtils';
import type { TeamFormIndex } from '@/app/utils/teamForm';
import type { GameInfo } from '../../types/domain/game';

/** How many recent results the markers under a listed team's logo show. */
const FORM_GAMES = 3;

/**
 * card — standalone game card; row — a row in a game-day box;
 * dense — the tighter row used for previous game days.
 */
export type GameVariant = 'card' | 'row' | 'dense';

interface GameContainerProps {
  game: GameInfo;
  league: League;
  variant?: GameVariant;
  /** Recent games to read each side's form from. Omitted = no form markers. */
  form?: TeamFormIndex;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  game,
  league,
  variant = 'row',
  form,
}) => {
  const isGameLive = (game: GameInfo) => {
    return (
      game.state === 'live' ||
      (game.state === 'not-started' &&
        isDateTimePassed(new Date(game.startDateTime)))
    );
  };

  const isGameFinished = (game: GameInfo) => game.state === 'finished';

  const dense = variant === 'dense';
  const wrapperClass =
    variant === 'card'
      ? 'rounded-lg border border-line bg-surface p-6'
      : dense
        ? 'px-4 py-2'
        : 'px-4 py-3';

  const score = getScore(game);

  // Form as it stood going into this game, so a finished row shows the three
  // games before it rather than counting itself.
  const homeForm =
    form?.formFor(
      game.homeTeamInfo.teamInfo.code,
      FORM_GAMES,
      game.startDateTime,
    ) ?? [];
  const awayForm =
    form?.formFor(
      game.awayTeamInfo.teamInfo.code,
      FORM_GAMES,
      game.startDateTime,
    ) ?? [];
  const showForm = homeForm.length > 0 || awayForm.length > 0;

  return (
    <div className={wrapperClass}>
      <div className="flex items-center">
        <div className={`flex-1 flex justify-end ${dense ? 'pr-5' : 'pr-8'}`}>
          <div className="flex flex-col items-center">
            <ClickableTeamLogo
              league={league}
              teamInfo={game.homeTeamInfo.teamInfo}
              opponent={game.awayTeamInfo.teamInfo}
              size={variant === 'card' ? 'lg' : dense ? 'sm' : 'md'}
            />
            {showForm && <TeamForm entries={homeForm} className="mt-1.5" />}
          </div>
        </div>

        <div className={`text-center shrink-0 ${dense ? 'w-28' : 'w-40'}`}>
          {score ? (
            <Score
              score={score}
              suffix={resultSuffix(game)}
              variant={variant}
            />
          ) : (
            <>
              <StadiumIcon className="mx-auto mb-2 h-[1.875rem] w-auto text-dim" />
              <p className="num text-sm text-dim mt-1 truncate">
                {game.venueInfo.name}
              </p>
            </>
          )}
        </div>

        <div className={`flex-1 flex justify-start ${dense ? 'pl-5' : 'pl-8'}`}>
          <div className="flex flex-col items-center">
            <ClickableTeamLogo
              league={league}
              teamInfo={game.awayTeamInfo.teamInfo}
              opponent={game.homeTeamInfo.teamInfo}
              size={variant === 'card' ? 'lg' : dense ? 'sm' : 'md'}
            />
            {showForm && <TeamForm entries={awayForm} className="mt-1.5" />}
          </div>
        </div>
      </div>

      {isGameLive(game) && (
        <div className="flex items-center">
          <div className="display inline-flex items-center text-sm uppercase tracking-[0.04em] text-dim mx-auto">
            <span className="w-2 h-2 rounded-full bg-otl inline-block mr-1"></span>
            Pågående
          </div>
        </div>
      )}
      {isGameFinished(game) && !score && (
        <div className="flex items-center">
          <div className="display inline-flex items-center text-sm uppercase tracking-[0.04em] text-dim mx-auto">
            <span className="w-2 h-2 rounded-full bg-win inline-block mr-1"></span>
            Slut
          </div>
        </div>
      )}
    </div>
  );
};

type GameScore = { home: number; away: number };

/** The final score, or null when the game has no reported result yet. */
function getScore(game: GameInfo): GameScore | null {
  if (game.state !== 'finished') return null;
  const home = game.homeTeamInfo.score;
  const away = game.awayTeamInfo.score;
  if (typeof home !== 'number' || typeof away !== 'number') return null;
  return { home, away };
}

/** Overtime / shootout marker below the score. */
function resultSuffix(game: GameInfo): string | null {
  if (game.shootout) return 'Str';
  if (game.overtime) return 'ÖT';
  return null;
}

function Score({
  score,
  suffix,
  variant,
}: {
  score: GameScore;
  suffix: string | null;
  variant: GameVariant;
}) {
  // The losing side is dimmed so the result reads at a glance.
  const homeClass = score.home >= score.away ? 'text-ink' : 'text-dim';
  const awayClass = score.away >= score.home ? 'text-ink' : 'text-dim';
  const dense = variant === 'dense';
  const sizeClass =
    variant === 'card'
      ? 'gap-3 text-4xl'
      : dense
        ? 'gap-2 text-xl'
        : 'gap-2 text-2xl';

  // Dense rows only carry the overtime marker — "Slut" is implied by the section.
  const marker = dense ? suffix : (suffix ?? 'Slut');

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`display num flex items-center font-bold leading-none ${sizeClass}`}
      >
        <span className={homeClass}>{score.home}</span>
        <span className="text-mute">–</span>
        <span className={awayClass}>{score.away}</span>
      </div>
      {marker && (
        <p
          className={`display mt-1 text-[0.625rem] font-medium uppercase tracking-[0.08em] ${
            suffix ? 'text-otl' : 'text-mute'
          }`}
        >
          {marker}
        </p>
      )}
    </div>
  );
}

export type { StatnetGameInfo } from '../../types/statnet/game';
