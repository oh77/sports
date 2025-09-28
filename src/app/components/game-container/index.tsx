import Image from 'next/image';
import Link from 'next/link';
import { StatnetGameInfo, StatnetTeamInfo } from '../../types/statnet/game';

interface GameContainerProps {
  game: StatnetGameInfo;
  league: 'shl' | 'sdhl' | 'chl';
}

export function GameContainer({ game, league }: GameContainerProps) {
  const formatTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  const getStadiumIcon = () => {
    return league === 'shl'
      ? "https://www.shl.se/assets/stadium-460843bd.svg"
      : "https://www.sdhl.se/assets/stadium-460843bd.svg";
  };

  const getTeamCode = (team: StatnetTeamInfo) => {
    return team.names?.code || team.code;
  };

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <div className="text-center mb-4">
        <p className="text-xl font-medium text-gray-800">
          {formatTime(game.startDateTime)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            {game.homeTeamInfo.icon ? (
              <Image
                src={game.homeTeamInfo.icon}
                alt={game.homeTeamInfo.names.short}
                width={league === 'shl' ? 48 : 64}
                height={league === 'shl' ? 48 : 64}
                className={`object-contain ${league === 'shl' ? 'w-12 h-12' : 'w-16 h-16'}`}
              />
            ) : (
              <span className="text-gray-400 text-xl">🏒</span>
            )}
          </div>
          <Link
            href={`/${league}/${encodeURIComponent(getTeamCode(game.homeTeamInfo))}`}
            className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {game.homeTeamInfo.names.short}
          </Link>
        </div>

        <div className="text-center mx-6">
          <Image
            src={getStadiumIcon()}
            alt="Arena"
            width={40}
            height={40}
            className="mx-auto mb-2 brightness-0"
          />
          <p className="text-sm text-gray-500 mt-1">
            {game.venueInfo.name}
          </p>
        </div>

        <div className="text-center flex-1">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            {game.awayTeamInfo.icon ? (
              <Image
                src={game.awayTeamInfo.icon}
                alt={game.awayTeamInfo.names.short}
                width={league === 'shl' ? 48 : 64}
                height={league === 'shl' ? 48 : 64}
                className={`object-contain ${league === 'shl' ? 'w-12 h-12' : 'w-16 h-16'}`}
              />
            ) : (
              <span className="text-gray-400 text-xl">🏒</span>
            )}
          </div>
          <Link
            href={`/${league}/${encodeURIComponent(getTeamCode(game.awayTeamInfo))}`}
            className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {game.awayTeamInfo.names.short}
          </Link>
        </div>
      </div>
    </div>
  );
}

export type { StatnetGameInfo } from '../../types/statnet/game';
