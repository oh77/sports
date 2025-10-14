import React from 'react';
import Image from 'next/image';
import { GameInfo } from '../../types/domain/game';

interface HeadToHeadProps {
  games: GameInfo[];
  teamCode1: string;
  teamCode2: string;
}

export function HeadToHead({ games, teamCode1, teamCode2 }: HeadToHeadProps) {
  // Filter games to only include matchups between these two teams
  const headToHeadGames = games.filter(game => {
    const homeCode = game.homeTeamInfo.teamInfo.code;
    const awayCode = game.awayTeamInfo.teamInfo.code;
    
    return (
      (homeCode === teamCode1 && awayCode === teamCode2) ||
      (homeCode === teamCode2 && awayCode === teamCode1)
    );
  }).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  // If no head-to-head games, don't render
  if (headToHeadGames.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mb-8 flex justify-center items-center gap-4">
      {headToHeadGames.map((game, index) => {
        const gameDate = new Date(game.startDateTime);
        const homeScore = game.homeTeamInfo.score;
        const awayScore = game.awayTeamInfo.score;
        
        // Check if game is finished
        const isFinished = game.state === 'finished';
        
        // Determine winner if game is finished
        let winnerLogo = null;
        if (isFinished) {
          if (homeScore > awayScore) {
            winnerLogo = game.homeTeamInfo.teamInfo.logo;
          } else if (awayScore > homeScore) {
            winnerLogo = game.awayTeamInfo.teamInfo.logo;
          }
        }

        // Format date for unplayed games
        const day = gameDate.getDate();
        const month = gameDate.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '');

        return (
          <div
            key={game.uuid || index}
            className={`w-12 h-12 rounded-full border-2 border-gray-500 flex items-center justify-center overflow-hidden ${winnerLogo ? 'bg-white' : 'bg-white/50'}`}
            title={`${game.homeTeamInfo.teamInfo.short} vs ${game.awayTeamInfo.teamInfo.short} - ${new Date(game.startDateTime).toLocaleDateString()}`}
          >
            {winnerLogo ? (
              <Image
                src={winnerLogo}
                alt="Winner"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="text-center text-xs text-gray-500 leading-tight font-bold">
                <div>{day}</div>
                <div>{month}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

