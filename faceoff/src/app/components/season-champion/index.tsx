import Image from 'next/image';
import type { GameInfo } from '@/app/types/domain/game';
import type { TeamInfo } from '@/app/types/domain/team';

interface SeasonChampionProps {
  team: TeamInfo;
  game: GameInfo;
}

/**
 * Shown on a league landing page when the season has no upcoming games: the
 * winner of the last played game (most likely the champion), with the final
 * score of that game.
 */
export function SeasonChampion({ team, game }: SeasonChampionProps) {
  const { homeTeamInfo, awayTeamInfo } = game;
  return (
    <div className="max-w-2xl mx-auto mb-8 rounded-lg border border-line bg-surface p-8 text-center">
      <div className="display text-sm font-semibold uppercase tracking-[0.04em] text-dim mb-6">
        Vinnare av säsongens sista match
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {team.logo ? (
            <Image
              src={team.logo}
              alt={team.short}
              width={128}
              height={128}
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-3 rounded-full flex items-center justify-center text-4xl">
              🏒
            </div>
          )}
          <span
            className="absolute -top-3 -right-3 text-4xl"
            aria-hidden="true"
          >
            🏆
          </span>
        </div>

        <h1 className="display text-3xl md:text-4xl font-bold text-ink uppercase tracking-[0.04em]">
          {team.full}
        </h1>

        <p className="num text-dim">
          {homeTeamInfo.teamInfo.short} {homeTeamInfo.score}–
          {awayTeamInfo.score} {awayTeamInfo.teamInfo.short}
        </p>
      </div>
    </div>
  );
}
