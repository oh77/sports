import Image from 'next/image';
import type { GameInfo, GameTeamInfo } from '@/app/types/domain/game';

interface FinalSeriesProps {
  games: GameInfo[];
}

/**
 * Compact list of every game in the final series (a single game up to a
 * best-of-7), most recent first. Team logos and result only — no dates.
 */
export function FinalSeries({ games }: FinalSeriesProps) {
  if (games.length === 0) return null;

  return (
    <div className="max-w-sm mx-auto mb-8">
      <h2 className="display mb-3 text-center text-sm font-medium uppercase tracking-[0.04em] text-soft">
        Final
      </h2>
      <ul className="divide-y divide-line-soft overflow-hidden rounded-lg border border-line bg-surface">
        {games.map((game) => {
          const { homeTeamInfo: home, awayTeamInfo: away } = game;
          const homeWon = home.score > away.score;
          const awayWon = away.score > home.score;
          return (
            <li
              key={game.uuid}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5"
            >
              <TeamLogo team={home} className="justify-self-end" />
              <span className="num shrink-0 tabular-nums text-base text-ink">
                <span className={homeWon ? 'font-bold' : 'text-dim'}>
                  {home.score}
                </span>
                <span className="text-mute">–</span>
                <span className={awayWon ? 'font-bold' : 'text-dim'}>
                  {away.score}
                </span>
              </span>
              <TeamLogo team={away} className="justify-self-start" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TeamLogo({
  team,
  className,
}: {
  team: GameTeamInfo;
  className?: string;
}) {
  const { teamInfo } = team;
  if (!teamInfo.logo) {
    return (
      <span className={`text-sm text-dim ${className}`}>{teamInfo.short}</span>
    );
  }
  return (
    <Image
      src={teamInfo.logo}
      alt={teamInfo.short}
      width={32}
      height={32}
      className={`h-7 w-7 object-contain ${className}`}
    />
  );
}
