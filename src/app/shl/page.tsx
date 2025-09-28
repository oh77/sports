'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LeagueService } from '../services/leagueService';
import { GameInfo } from '../types/game';
import { GameGroup } from '../components/game-group';

export default function SHLPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameDate, setGameDate] = useState<string>('');

  useEffect(() => {
    const loadNextGameDay = async () => {
      try {
        setLoading(true);
        const leagueService = new LeagueService('shl');
        
        // Try to get stored games first
        let storedGames = leagueService.getStoredGames();
        
        if (storedGames.length === 0) {
          // Fetch fresh data if none stored
          storedGames = await leagueService.fetchGames();
        }
        
        if (storedGames.length > 0) {
          const now = new Date();
          const today = new Date();
          const todayString = today.toDateString();
          
          // Find the next available game date
          const futureGames = storedGames.filter(game => new Date(game.startDateTime) >= now);
          
          if (futureGames.length > 0) {
            // Get the first future game date
            const firstGameDate = new Date(futureGames[0].startDateTime);
            const firstGameDateString = firstGameDate.toDateString();
            
            // Check if the next game date is today
            const targetDateString = firstGameDateString === todayString ? todayString : firstGameDateString;
            
            // Get all games for the target date
            const targetGames = storedGames.filter(game => {
              const gameDate = new Date(game.startDateTime);
              return gameDate.toDateString() === targetDateString;
            });
            
            if (targetGames.length > 0) {
              setGames(targetGames);
              setGameDate(firstGameDate.toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }));
            } else {
              setError('Inga matcher hittades');
            }
          } else {
            setError('Inga kommande matcher hittades');
          }
        } else {
          setError('Ingen matchdata tillgänglig');
        }
      } catch (err) {
        setError('Misslyckades att ladda matchdata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNextGameDay();
  }, []);

  const formatGameTime = (startDateTime: string) => {
    const date = new Date(startDateTime);
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Group games by time
  const groupGamesByTime = (games: GameInfo[]) => {
    const grouped = games.reduce((acc, game) => {
      const time = formatGameTime(game.startDateTime);
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(game);
      return acc;
    }, {} as Record<string, GameInfo[]>);

    // Sort times
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const [aHour, aMin] = a.split(':').map(Number);
      const [bHour, bMin] = b.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });

    return sortedTimes.map(time => ({
      time,
      games: grouped[time]
    }));
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
                MATCHDAG
              </h1>
              <p className="text-2xl text-gray-200 mt-2">
                {gameDate || 'Inga Matcher Tillgängliga'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Inga Matcher Hittades'}
            </h2>
            <p className="text-gray-200 mb-6">
              {error || 'Inga kommande matcher tillgängliga just nu'}
            </p>
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till Hem
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
              MATCHDAG
            </h1>
            <p className="text-2xl text-gray-200 mt-2">
              {gameDate}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {groupGamesByTime(games).map((group) => (
            <GameGroup
              key={group.time}
              time={group.time}
              games={group.games}
              league="shl"
            />
          ))}
        </div>

        <div className="text-center mt-8 space-x-4">
          <Link 
            href="/shl/standings" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Visa Ligatabell
          </Link>
          <Link 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Tillbaka till Hem
          </Link>
        </div>
      </div>
    </main>
  );
}
