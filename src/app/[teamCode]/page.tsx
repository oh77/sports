'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SHLService } from '../services/shlService';

interface TeamInfo {
  code: string;
  names: {
    short: string;
    long: string;
    full: string;
  };
  icon: string;
  score: string;
}

interface VenueInfo {
  name: string;
}

interface GameInfo {
  uuid: string;
  startDateTime: string;
  state: string;
  homeTeamInfo: TeamInfo;
  awayTeamInfo: TeamInfo;
  venueInfo: VenueInfo;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TeamPage() {
  const params = useParams();
  const teamCode = params.teamCode as string;
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const loadTeamGame = async () => {
      try {
        setLoading(true);
        const shlService = new SHLService();
        
        // Try to get stored game first
        let storedGame = shlService.getNextGameForTeam(teamCode);
        
        if (!storedGame) {
          // Fetch fresh data if none stored
          await shlService.fetchGames();
          storedGame = shlService.getNextGameForTeam(teamCode);
        }
        
        if (storedGame) {
          setGame(storedGame);
          // Determine which team info to show (home or away)
          const isHomeTeam = storedGame.homeTeamInfo.code === teamCode;
          setTeamInfo(isHomeTeam ? storedGame.homeTeamInfo : storedGame.awayTeamInfo);
        } else {
          setError('No upcoming games found for this team');
        }
      } catch (err) {
        setError('Failed to load team game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (teamCode) {
      loadTeamGame();
    }
  }, [teamCode]);

  useEffect(() => {
    if (!game) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      // console.log(now);
      const gameTime = new Date(game.startDateTime).getTime();
      // console.log(gameTime);
      const distance = gameTime - now;
      // console.log(distance);

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Update countdown immediately
    updateCountdown();
    
    // Update countdown every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [game]);

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  const getOpponentInfo = (game: GameInfo, teamCode: string) => {
    return game.homeTeamInfo.code === teamCode ? game.awayTeamInfo : game.homeTeamInfo;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8 w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !game || !teamInfo) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error || 'Team Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || `No upcoming games found for team code: ${teamCode}`}
            </p>
            <a 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const opponentInfo = getOpponentInfo(game, teamCode);
  const isHomeGame = game.homeTeamInfo.code === teamCode;

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {teamInfo.names.full}
          </h1>
          <div className="flex items-center justify-center gap-4">
            {teamInfo.icon ? (
              <img 
                src={teamInfo.icon} 
                alt={teamInfo.names.short}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-2xl">🏒</span>
              </div>
            )}
            <div className="text-left">
              <p className="text-lg text-gray-600">Next Game</p>
              <p className="text-2xl font-semibold text-gray-800">
                {isHomeGame ? 'Home' : 'Away'} vs {opponentInfo.names.short}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold text-center mb-4">
              Game Starts In
            </h2>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.days}</div>
                  <div className="text-sm opacity-90">Days</div>
                </div>
              </div>
              <div className="text-center">
                <div className="rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="text-sm opacity-90">Hours</div>
                </div>
              </div>
              <div className="text-center">
                <div className="rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-sm opacity-90">Minutes</div>
                </div>
              </div>
              <div className="text-center">
                <div className="rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-sm opacity-90">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">Date & Time</p>
              <p className="text-xl font-medium text-gray-800">
                {formatDateTime(game.startDateTime)}
              </p>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {teamInfo.icon ? (
                    <img 
                      src={teamInfo.icon} 
                      alt={teamInfo.names.short}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">🏒</span>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-800">
                  {teamInfo.names.short}
                </p>
                <p className="text-sm text-gray-600">(Your Team)</p>
              </div>
              
              <div className="text-center mx-6">
                <span className="text-3xl font-bold text-gray-600">VS</span>
                <p className="text-sm text-gray-500 mt-1">
                  {isHomeGame ? 'Home Game' : 'Away Game'}
                </p>
              </div>
              
              <div className="text-center flex-1">
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {opponentInfo.icon ? (
                    <img 
                      src={opponentInfo.icon} 
                      alt={opponentInfo.names.short}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">🏒</span>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-800">
                  {opponentInfo.names.short}
                </p>
                <p className="text-sm text-gray-600">(Opponent)</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Venue</p>
              <p className="text-lg font-medium text-gray-800">
                {game.venueInfo.name}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
