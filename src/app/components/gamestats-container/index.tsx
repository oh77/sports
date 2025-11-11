import React from 'react';
import GameStats from '@/app/components/game-stats';
import type { GameInfo } from '@/app/types/domain/game';

interface HomeAwayContainerProps {
  allGames: GameInfo[];
  currentGame: GameInfo;
}

// Renders two columns: one for the home team (home-only stats) and one for the away team (away-only stats)
export const GameStatsContainer: React.FC<HomeAwayContainerProps> = ({
  allGames,
  currentGame,
}) => {
  const homeTeamCode = currentGame.homeTeamInfo.teamInfo.code;
  const awayTeamCode = currentGame.awayTeamInfo.teamInfo.code;

  // Filter only finished games with valid numeric scores
  const finishedGames = React.useMemo(
    () =>
      allGames.filter(
        (g) =>
          g.state === 'finished' &&
          typeof g.homeTeamInfo.score === 'number' &&
          typeof g.awayTeamInfo.score === 'number',
      ),
    [allGames],
  );

  const homeOnlyGames = React.useMemo(
    () =>
      finishedGames.filter(
        (g) => g.homeTeamInfo.teamInfo.code === homeTeamCode,
      ),
    [finishedGames, homeTeamCode],
  );

  const awayOnlyGames = React.useMemo(
    () =>
      finishedGames.filter(
        (g) => g.awayTeamInfo.teamInfo.code === awayTeamCode,
      ),
    [finishedGames, awayTeamCode],
  );

  const homeLastFiveGames = React.useMemo(() => {
    const homeTeamGames = finishedGames
      .filter(
        (g) =>
          g.homeTeamInfo.teamInfo.code === homeTeamCode ||
          g.awayTeamInfo.teamInfo.code === homeTeamCode,
      )
      .sort(
        (a, b) =>
          new Date(b.startDateTime).getTime() -
          new Date(a.startDateTime).getTime(),
      );
    return homeTeamGames.slice(0, 5);
  }, [finishedGames, homeTeamCode]);

  const awayLastFiveGames = React.useMemo(() => {
    const awayTeamGames = finishedGames
      .filter(
        (g) =>
          g.homeTeamInfo.teamInfo.code === awayTeamCode ||
          g.awayTeamInfo.teamInfo.code === awayTeamCode,
      )
      .sort(
        (a, b) =>
          new Date(b.startDateTime).getTime() -
          new Date(a.startDateTime).getTime(),
      );
    return awayTeamGames.slice(0, 5);
  }, [finishedGames, awayTeamCode]);

  return (
    <div
      className="rounded-lg shadow p-3"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
    >
      <div className="grid grid-cols-12">
        <div className="col-span-5">
          <GameStats games={homeOnlyGames} teamCode={homeTeamCode} />
        </div>
        <div className="col-span-2 mt-3.5">
          <div className="text-xs text-gray-700 mb-1 ml-1 text-center">
            Hemma / Borta
          </div>
        </div>
        <div className="col-span-5">
          <GameStats games={awayOnlyGames} teamCode={awayTeamCode} />
        </div>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-5">
          <GameStats games={homeLastFiveGames} teamCode={homeTeamCode} />
        </div>
        <div className="col-span-2 mt-3.5">
          <div className="text-xs text-gray-700 mb-1 ml-1 text-center">
            5 senaste
          </div>
        </div>
        <div className="col-span-5">
          <GameStats games={awayLastFiveGames} teamCode={awayTeamCode} />
        </div>
      </div>
    </div>
  );
};

export default GameStatsContainer;
