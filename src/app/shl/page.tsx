'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SHLService } from '../services/shlService';

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

export default function SHLPage() {
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
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <div className="w-20 h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="text-center">
              <div className="h-12 bg-gray-300 rounded mb-2 w-48 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          
          <div className="animate-pulse">
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
      <main className="min-h-screen py-12 relative bg-[rgba(24,29,38,1)]">
        {/* Background SHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <Image 
              src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
              alt="SHL Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
                GAME DAY
              </h1>
              <p className="text-2xl text-gray-200 mt-2">
                {gameDate || 'No Games Available'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'No Games Found'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'No upcoming games available at the moment'}
            </p>
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Sticky Background SHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <Image 
          src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
          alt="SHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
            alt="SHL Logo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
              GAME DAY
            </h1>
            <p className="text-2xl text-gray-200 mt-2">
              {gameDate}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {games.map((game) => (
            <div key={game.uuid} className="rounded-lg shadow-lg p-6  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}">
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
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xl">🏒</span>
                    )}
                  </div>
                <Link 
                  href={`/shl/${game.homeTeamInfo.code}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {game.homeTeamInfo.names.short}
                </Link>
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
                <Link 
                  href={`/shl/${game.awayTeamInfo.code}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {game.awayTeamInfo.names.short}
                </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
