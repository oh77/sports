import Image from 'next/image';
import Link from 'next/link';
import { getTeamLogoWithFallback } from '../../utils/teamLogos';

interface GameGroupProps {
  time: string;
  games: any[];
  league: 'chl' | 'shl' | 'sdhl';
}

export function GameGroup({ time, games, league }: GameGroupProps) {
  const getTeamLogo = (team: any) => {
    if (league === 'chl') {
      // Use the proper CHL logo utility
      return getTeamLogoWithFallback({
        shortName: team.shortName,
        externalId: team.externalId,
        country: team.country ? { code: team.country } : undefined
      });
    }
    return team.icon || 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg';
  };

  const getTeamCode = (team: any) => {
    if (league === 'chl') {
      return team.shortName?.toUpperCase() || team.name;
    }
    return team.names?.code || team.code;
  };

  const getTeamName = (team: any) => {
    if (league === 'chl') {
      return team.name;
    }
    return team.names?.short || team.name;
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

  const getVenueName = (game: any) => {
    if (league === 'chl') {
      return game.venue;
    }
    return game.venueInfo?.name || 'Unknown venue';
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
            key={league === 'chl' ? game.id : game.uuid || index}
            className="rounded-lg shadow-lg p-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image
                    src={getTeamLogo(league === 'chl' ? game.homeTeam : game.homeTeamInfo)}
                    alt={`${getTeamName(league === 'chl' ? game.homeTeam : game.homeTeamInfo)} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <Link 
                  href={`/${league}/${encodeURIComponent(getTeamCode(league === 'chl' ? game.homeTeam : game.homeTeamInfo))}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {getTeamName(league === 'chl' ? game.homeTeam : game.homeTeamInfo)}
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
                    src={getTeamLogo(league === 'chl' ? game.awayTeam : game.awayTeamInfo)}
                    alt={`${getTeamName(league === 'chl' ? game.awayTeam : game.awayTeamInfo)} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <Link 
                  href={`/${league}/${encodeURIComponent(getTeamCode(league === 'chl' ? game.awayTeam : game.awayTeamInfo))}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {getTeamName(league === 'chl' ? game.awayTeam : game.awayTeamInfo)}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
