import type React from 'react';
import { HeadToHeadCircle } from '@/app/components/head-to-head/headToHeadCircle';
import type { GameInfo } from '../../types/domain/game';

interface HeadToHeadProps {
  games: GameInfo[];
  teamCode1: string;
  teamCode2: string;
}

export const HeadToHead: React.FC<HeadToHeadProps> = ({
  games,
  teamCode1,
  teamCode2,
}) => {
  // Filter games to only include matchups between these two teams
  const headToHeadGames = games
    .filter((game) => {
      const homeCode = game.homeTeamInfo.teamInfo.code;
      const awayCode = game.awayTeamInfo.teamInfo.code;

      return (
        (homeCode === teamCode1 && awayCode === teamCode2) ||
        (homeCode === teamCode2 && awayCode === teamCode1)
      );
    })
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  // If no head-to-head games, don't render
  if (headToHeadGames.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mb-8 flex justify-center items-center gap-4">
      {headToHeadGames.map((game) => (
        <HeadToHeadCircle game={game} key={game.uuid} />
      ))}
    </div>
  );
};
