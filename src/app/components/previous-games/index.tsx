import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {GameInfo, GameTeamInfo} from '../../types/domain/game';
import {League} from "@/app/types/domain/league";
import {ScoreOrStatus} from "@/app/components/previous-games/scoreOrStatus";

interface PreviousGamesProps {
  games: GameInfo[];
  currentTeamCode: string;
  league: League;
}

const PreviousGames: React.FC<PreviousGamesProps> = ({ games, currentTeamCode, league }) => {
  const getTeamCode = (teamInfo: GameTeamInfo): string => {
    return teamInfo.teamInfo.code;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Tidigare Matcher</h2>
      <div className="space-y-3">
        {games.map((prevGame) => {
          const isHomeTeam = getTeamCode(prevGame.homeTeamInfo) === currentTeamCode;
          const opponentInfo = isHomeTeam ? prevGame.awayTeamInfo : prevGame.homeTeamInfo;

          return (
            <div key={prevGame.uuid} className="rounded-lg shadow-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {opponentInfo.teamInfo.logo ? (
                      <Image
                        src={opponentInfo.teamInfo.logo}
                        alt={opponentInfo.teamInfo.short}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">🏒</span>
                    )}
                  </div>
                  <Link
                    href={`/${league}/${encodeURIComponent(getTeamCode(opponentInfo))}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {opponentInfo.teamInfo.short} ({isHomeTeam ? 'H' : 'A'})
                  </Link>
                </div>

                <div className="text-center">
                    <ScoreOrStatus gameInfo={prevGame} isHomeTeam={isHomeTeam} />
                </div>
              </div>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="text-center text-gray-200 py-4">
            Inga tidigare matcher hittades
          </div>
        )}
      </div>
    </div>
  );
};
export default PreviousGames
