'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SHLService } from './services/shlService';

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

export default function Home() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const shlService = new SHLService();
        
        // Try to get stored games first
        let storedGames = shlService.getStoredGames();
        
        if (storedGames.length === 0) {
          // Fetch fresh data if none stored
          storedGames = await shlService.fetchGames();
        }
        
        if (storedGames.length > 0) {
          // Find the next game day (all games on the same date)
          const now = new Date();
          const futureGames = storedGames.filter(game => new Date(game.startDateTime) > now);
          
          if (futureGames.length > 0) {
            // Get the first future game date
            const firstGameDate = new Date(futureGames[0].startDateTime);
            const nextGameDay = futureGames.filter(game => {
              const gameDate = new Date(game.startDateTime);
              return gameDate.toDateString() === firstGameDate.toDateString();
            });
            
            setGames(nextGameDay);
            setGameDate(firstGameDate.toLocaleDateString('sv-SE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          } else {
            setError('No upcoming games found');
          }
        } else {
          setError('No game data available');
        }
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8 w-1/3 mx-auto"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || games.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error || 'No Games Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'No upcoming games available at the moment'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to SHL
          </h1>
          <p className="text-2xl text-gray-600">
            Next Game Day: {gameDate}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {games.map((game) => (
            <div key={game.uuid} className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Game Time</p>
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
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xl">🏒</span>
                    )}
                  </div>
                  <p className="text-lg font-medium text-gray-800">
                    {game.homeTeamInfo.names.short}
                  </p>
                  <p className="text-sm text-gray-600">(Home)</p>
                </div>
                
                <div className="text-center mx-6">
                  <span className="text-2xl font-bold text-gray-600">VS</span>
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
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xl">🏒</span>
                    )}
                  </div>
                  <p className="text-lg font-medium text-gray-800">
                    {game.awayTeamInfo.names.short}
                  </p>
                  <p className="text-sm text-gray-600">(Away)</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a 
                  href={`/${game.homeTeamInfo.code}`}
                  className="text-blue-500 hover:text-blue-600 text-sm mr-4"
                >
                  {game.homeTeamInfo.names.short} Schedule
                </a>
                <a 
                  href={`/${game.awayTeamInfo.code}`}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  {game.awayTeamInfo.names.short} Schedule
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
