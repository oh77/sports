'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SHLService } from '../../services/shlService';

interface TeamInfo {
  code: string;
  names: {
    short: string;
    long: string;
    full: string;
  };
  icon: string;
  score: number;
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
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);

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
          
          // Load previous and upcoming games
          const prevGames = shlService.getPreviousGamesForTeam(teamCode, 3);
          const upcGames = shlService.getUpcomingGamesForTeam(teamCode, 3);
          setPreviousGames(prevGames);
          setUpcomingGames(upcGames);
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
      <main className="min-h-screen bg-gray-100 py-12 relative">
        <div className="container mx-auto px-4 relative z-10">
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
      <main className="min-h-screen bg-gray-100 py-12 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error || 'Team Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || `No upcoming games found for team code: ${teamCode}`}
            </p>
            <Link 
              href="/shl" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to SHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const opponentInfo = getOpponentInfo(game, teamCode);
  const isHomeGame = game.homeTeamInfo.code === teamCode;

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background Team Logo */}
      {teamInfo.icon && (
        <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
          <Image 
            src={teamInfo.icon} 
            alt={`${teamInfo.names.short} Background`}
            width={1200}
            height={1200}
            className="opacity-10 w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="flex items-center justify-center gap-6 mb-8 py-6">
          {teamInfo.icon ? (
            <Image 
              src={teamInfo.icon} 
              alt={teamInfo.names.short}
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-3xl">🏒</span>
            </div>
          )}
          <h1 className="text-5xl font-bold text-gray-800 uppercase tracking-wider">
            {teamInfo.names.full}
          </h1>
        </div>

        {/* Next Game Info */}
        {/* <div className="max-w-2xl mx-auto mb-8">
          <div className="rounded-lg shadow-lg p-6 text-gray-800" style={{ backgroundColor: 'rgba(128, 128, 128, 0.8)' }}>
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {opponentInfo.names.short} ({isHomeGame ? 'H' : 'A'})
              </p>
            </div>
          </div>
        </div> */}

        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
            <div className="text-center mb-6">
              <p className="text-xl font-medium text-gray-800">
                {formatDateTime(game.startDateTime)}
              </p>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {game.homeTeamInfo.icon ? (
                    <Image 
                      src={game.homeTeamInfo.icon} 
                      alt={game.homeTeamInfo.names.short}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">🏒</span>
                  )}
                </div>
              </div>
              
              <div className="text-center mx-6">
                <Image 
                  src="https://www.shl.se/assets/stadium-460843bd.svg"
                  alt="Stadium"
                  width={40}
                  height={40}
                  className="mx-auto mb-2 brightness-0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {game.venueInfo.name}
                </p>
              </div>
              
              <div className="text-center flex-1">
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {game.awayTeamInfo.icon ? (
                    <Image 
                      src={game.awayTeamInfo.icon} 
                      alt={game.awayTeamInfo.names.short}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">🏒</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Previous and Upcoming Games */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Previous Games */}
            {previousGames.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Previous Games</h2>
                <div className="space-y-2">
                  {previousGames.map((prevGame) => {
                    const isHomeTeam = prevGame.homeTeamInfo.code === teamCode;
                    const opponentInfo = isHomeTeam ? prevGame.awayTeamInfo : prevGame.homeTeamInfo;
                    const currentTeamScore = isHomeTeam ? prevGame.homeTeamInfo.score : prevGame.awayTeamInfo.score;
                    const opponentScore = isHomeTeam ? prevGame.awayTeamInfo.score : prevGame.homeTeamInfo.score;
                    
                    return (
                      <div key={prevGame.uuid} className="rounded-lg shadow-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {opponentInfo.icon ? (
                                <Image 
                                  src={opponentInfo.icon} 
                                  alt={opponentInfo.names.short}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">🏒</span>
                              )}
                            </div>
                            <Link 
                              href={`/shl/${opponentInfo.code}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {opponentInfo.names.short} ({isHomeTeam ? 'H' : 'A'})
                            </Link>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-800">
                              {currentTeamScore} - {opponentScore}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Upcoming Games</h2>
                <div className="space-y-2">
                  {upcomingGames.map((upcGame) => {
                    const isHomeTeam = upcGame.homeTeamInfo.code === teamCode;
                    const opponentInfo = isHomeTeam ? upcGame.awayTeamInfo : upcGame.homeTeamInfo;
                    
                    return (
                      <div key={upcGame.uuid} className="rounded-lg shadow-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {opponentInfo.icon ? (
                                <Image 
                                  src={opponentInfo.icon} 
                                  alt={opponentInfo.names.short}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">🏒</span>
                              )}
                            </div>
                            <Link 
                              href={`/shl/${opponentInfo.code}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {opponentInfo.names.short} ({isHomeTeam ? 'H' : 'A'})
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/shl" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to SHL
          </Link>
        </div>
      </div>
    </main>
  );
}
