'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LeagueService } from '../services/leagueService';
import { GameContainer } from '../components/game-container';
import { GameInfo } from '../types/game';

export default function SDHLPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const leagueService = new LeagueService('sdhl');
        
        // Try to get stored games first
        let storedGames = leagueService.getStoredGames();
        
        if (storedGames.length === 0) {
          // Fetch fresh data if none stored
          storedGames = await leagueService.fetchGames();
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


  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Sticky Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
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
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Sticky Background SDHL Logo */}
        <div className="fixed top-0 right-0 z-0">
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Background"
            width={400}
            height={400}
            className="opacity-10 transform rotate-12"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Row */}
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <Image 
              src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
              alt="SDHL Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
                GAME DAY
              </h1>
              <p className="text-2xl text-gray-600 mt-2">
                {gameDate || 'No Games Available'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'No Games Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'No upcoming games available at the moment'}
            </p>
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-gray-800 px-6 py-3 rounded-lg transition-colors"
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
      {/* Sticky Background SDHL Logo */}
      <div className="fixed top-0 right-0 z-0">
        <Image 
          src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
          alt="SDHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
          <Image 
            src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
            alt="SDHL Logo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white uppercase tracking-wider">
              GAME DAY
            </h1>
            <p className="text-2xl text-gray-600 mt-2">
              {gameDate}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {games.map((game) => (
            <GameContainer key={game.uuid} game={game} league="sdhl" />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-gray-800 px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}