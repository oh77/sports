import { GameInfo } from '../../types/domain/game';

interface TrendMarkersProps {
  games: GameInfo[];
  homeTeamCode: string;
  awayTeamCode: string;
}

type GameResult = 'win' | 'win-ot' | 'loss' | 'loss-ot';

interface TeamGameResult {
  result: GameResult;
  opponent: string;
  location: 'H' | 'B';
  teamScore: number;
  opponentScore: number;
}

export function TrendMarkers({ games, homeTeamCode, awayTeamCode }: TrendMarkersProps) {
  const getTeamResults = (teamCode: string): TeamGameResult[] => {
    return games
      .filter(game => game.state === 'finished')
      .filter(game => 
        game.homeTeamInfo.teamInfo.code === teamCode || 
        game.awayTeamInfo.teamInfo.code === teamCode
      )
      .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())
      .slice(0, 10)
      .reverse()
      .map(game => {
        const isHomeTeam = game.homeTeamInfo.teamInfo.code === teamCode;
        const teamScore = isHomeTeam ? game.homeTeamInfo.score : game.awayTeamInfo.score;
        const opponentScore = isHomeTeam ? game.awayTeamInfo.score : game.homeTeamInfo.score;
        const opponent = isHomeTeam ? game.awayTeamInfo.teamInfo.short : game.homeTeamInfo.teamInfo.short;
        
        const won = teamScore > opponentScore;
        const afterRegulation = game.overtime || game.shootout;
        
        let result: GameResult;
        if (won) {
          result = afterRegulation ? 'win-ot' : 'win';
        } else {
          result = afterRegulation ? 'loss-ot' : 'loss';
        }

        return {
          result,
          opponent,
          location: isHomeTeam ? 'H' : 'B',
          teamScore,
          opponentScore
        };
      });
  };

  const homeResults = getTeamResults(homeTeamCode);
  const awayResults = getTeamResults(awayTeamCode);

  // Hide if no games played
  if (homeResults.length === 0 && awayResults.length === 0) {
    return null;
  }

  const getResultColor = (result: GameResult): string => {
    switch (result) {
      case 'win':
        return 'bg-green-500';
      case 'win-ot':
        return 'bg-green-300';
      case 'loss':
        return 'bg-red-500';
      case 'loss-ot':
        return 'bg-red-300';
    }
  };

  const renderTrend = (results: TeamGameResult[], align: 'left' | 'right') => {
    if (results.length === 0) {
      return <div className={`text-xs text-gray-400 ${align === 'left' ? 'text-left' : 'text-right'}`}>Inga matcher</div>;
    }

    return (
      <div className={`flex gap-1.5 ${align === 'left' ? 'justify-start' : 'justify-end'}`}>
        {results.map((gameResult, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${getResultColor(gameResult.result)}`}
            title={`${gameResult.opponent} (${gameResult.location}) ${gameResult.teamScore}-${gameResult.opponentScore}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4">
      <div className="flex justify-between items-center px-4">
        <div>
          {renderTrend(homeResults, 'left')}
        </div>
        <div>
          {renderTrend(awayResults, 'right')}
        </div>
      </div>
    </div>
  );
}

