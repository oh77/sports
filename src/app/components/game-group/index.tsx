import Image from 'next/image';
import Link from 'next/link';
import { getTeamLogoWithFallback } from '../../utils/teamLogos';
import { GameInfo } from '../../types/domain/game';
import { League } from '@/app/types/domain/league';

interface GameGroupProps {
  time: string;
  games: GameInfo[];
  league: League;
}

export function GameGroup({ time, games, league }: GameGroupProps) {
  const getTeamLogo = (teamInfo: { code: string; short: string; long: string; full: string; logo: string }) => {
    if (league === 'chl') {
      // Use the proper CHL logo utility
      return getTeamLogoWithFallback({
        shortName: teamInfo.short,
        externalId: teamInfo.code,
        country: undefined
      });
    }
    return teamInfo.logo || 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg';
  };

  const getTeamCode = (teamInfo: { code: string; short: string; long: string; full: string; logo: string }) => {
    return teamInfo.code;
  };

  const getTeamName = (teamInfo: { code: string; short: string; long: string; full: string; logo: string }) => {
    return teamInfo.short;
  };

  const getStadiumIcon = () => {
    switch (league) {
      case 'chl':
        return "https://www.shl.se/assets/stadium-460843bd.svg";
      case 'shl':
        return "https://www.shl.se/assets/stadium-460843bd.svg";
      case 'sdhl':
        return "https://www.sdhl.se/assets/stadium-460843bd.svg";
      default:
        return "https://www.shl.se/assets/stadium-460843bd.svg";
    }
  };

  const getVenueName = (game: GameInfo) => {
    return game.venueInfo.name || 'Unknown venue';
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className={`text-2xl font-bold mb-2 ${league === 'chl' ? 'text-white' : 'text-gray-800'}`}>
          {time}
        </h2>
      </div>
      
      <div className="space-y-4">
        {games.map((game, index) => (
          <div 
            key={game.uuid || index}
            className="rounded-lg shadow-lg p-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image
                    src={getTeamLogo(game.homeTeamInfo.teamInfo)}
                    alt={`${getTeamName(game.homeTeamInfo.teamInfo)} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <Link 
                  href={`/${league}/${encodeURIComponent(getTeamCode(game.homeTeamInfo.teamInfo))}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {getTeamName(game.homeTeamInfo.teamInfo)}
                </Link>
              </div>
              
              {/* Venue */}
              <div className="text-center mx-6">
                <Image 
                  src={getStadiumIcon()}
                  alt="Arena"
                  width={40}
                  height={40}
                  className="mx-auto mb-2 brightness-0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {getVenueName(game)}
                </p>
              </div>
              
              {/* Away Team */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image
                    src={getTeamLogo(game.awayTeamInfo.teamInfo)}
                    alt={`${getTeamName(game.awayTeamInfo.teamInfo)} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <Link 
                  href={`/${league}/${encodeURIComponent(getTeamCode(game.awayTeamInfo.teamInfo))}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {getTeamName(game.awayTeamInfo.teamInfo)}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
