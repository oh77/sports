'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LeagueService } from '../../services/leagueService';
import PreviousGames from '../../components/previous-games';
import UpcomingGames from '../../components/upcoming-games';
import NextGame from '../../components/next-game';
import { LeagueFooter } from '../../components/league-footer';
import { GameInfo, TeamInfo } from '../../types/game';


export default function TeamPage({ params }: { params: Promise<{ teamCode: string }> }) {
  const resolvedParams = React.use(params);
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    const loadTeamGame = async () => {
      try {
        setLoading(true);
        const leagueService = new LeagueService('shl');
        
        // Try to get stored game first
        let storedGame = leagueService.getNextGameForTeam(teamCode);
        
        if (!storedGame) {
          // Fetch fresh data if none stored
          await leagueService.fetchGames();
          storedGame = leagueService.getNextGameForTeam(teamCode);
        }
        
        if (storedGame) {
          setGame(storedGame);
          // Determine which team info to show (home or away)
          const isHomeTeam = (storedGame.homeTeamInfo.names?.code || storedGame.homeTeamInfo.code) === teamCode;
          setTeamInfo(isHomeTeam ? storedGame.homeTeamInfo : storedGame.awayTeamInfo);
          
          // Load previous and upcoming games
          const prevGames = leagueService.getPreviousGamesForTeam(teamCode, 3);
          const upcGames = leagueService.getUpcomingGamesForTeam(teamCode, 3);
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

        <NextGame 
          game={game} 
          currentTeamCode={teamCode} 
          league="shl" 
        />

        {/* Previous and Upcoming Games */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PreviousGames 
              games={previousGames} 
              currentTeamCode={teamCode} 
              league="shl" 
            />

            <UpcomingGames 
              games={upcomingGames} 
              currentTeamCode={teamCode} 
              league="shl" 
            />
          </div>
        </div>

        <LeagueFooter league="shl" currentTeamCode={teamCode} />
      </div>
    </main>
  );
}
