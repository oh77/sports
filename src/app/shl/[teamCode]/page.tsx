'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LeagueService } from '../../services/leagueService';
import PreviousGames from '../../components/previous-games';
import UpcomingGames from '../../components/upcoming-games';
import NextGame from '../../components/next-game';
import { LeagueFooter } from '../../components/league-footer';
import { CompactStandings } from '../../components/compact-standings';
import { HeadToHead } from '../../components/head-to-head';
import { GameInfo } from '../../types/domain/game';
import { TeamInfo } from '../../types/domain/team';
import { StandingsData } from '../../types/domain/standings';

export default function TeamPage({ params }: { params: Promise<{ teamCode: string }> }) {
  const resolvedParams = React.use(params);
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    const loadTeamGame = async () => {
      try {
        setLoading(true);
        const leagueService = new LeagueService('shl');

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();
        setAllGames(games);
        
        const nextGame = leagueService.getNextGameForTeam(teamCode);

        if (nextGame) {
          setGame(nextGame);
          // Determine which team info to show (home or away)
          const isHomeTeam = nextGame.homeTeamInfo.teamInfo.code === teamCode;
          setTeamInfo(isHomeTeam ? nextGame.homeTeamInfo.teamInfo : nextGame.awayTeamInfo.teamInfo);

          // Load previous and upcoming games
          const prevGames = leagueService.getPreviousGamesForTeam(teamCode, 3);
          const upcGames = leagueService.getUpcomingGamesForTeam(teamCode, 3);
          setPreviousGames(prevGames);
          setUpcomingGames(upcGames);

          // Load standings data
          try {
            const standingsResponse = await fetch('/api/shl-standings');
            if (standingsResponse.ok) {
              const standingsData = await standingsResponse.json();
              setStandings(standingsData);
            }
          } catch (err) {
            console.error('Failed to load standings:', err);
          }
        } else {
          setError('Inga kommande matcher hittades för detta lag');
        }
      } catch (err) {
        setError('Misslyckades att ladda lagdata');
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
              {error || 'Lag Inte Hittat'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || `Inga kommande matcher hittades för lagkod: ${teamCode}`}
            </p>
            <Link
              href="/shl"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till SHL
            </Link>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background Team Logo */}
      {teamInfo.logo && (
        <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
          <Image
            src={teamInfo.logo}
            alt={`${teamInfo.short} Background`}
            width={1200}
            height={1200}
            className="opacity-10 w-full h-full object-contain"
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6">
          {teamInfo.logo ? (
            <Image
              src={teamInfo.logo}
              alt={teamInfo.short}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-2xl md:text-3xl">🏒</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 uppercase tracking-wider text-center md:text-left">
            {teamInfo.full}
          </h1>
        </div>

        {/* Next Game Info */}
        {/* <div className="max-w-2xl mx-auto mb-8">
          <div className="rounded-lg shadow-lg p-6 text-gray-800" style={{ backgroundColor: 'rgba(128, 128, 128, 0.8)' }}>
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {opponentInfo.short} ({isHomeGame ? 'H' : 'A'})
              </p>
            </div>
          </div>
        </div> */}

        <NextGame
          game={game}
          currentTeamCode={teamCode}
          league="shl"
          allGames={allGames}
        />

        {/* Head to Head */}
        {game && (
          <HeadToHead
            games={allGames}
            teamCode1={game.homeTeamInfo.teamInfo.code}
            teamCode2={game.awayTeamInfo.teamInfo.code}
          />
        )}

        {/* Compact Standings */}
        {standings && (
          <div className="max-w-6xl mx-auto mb-8">
            <CompactStandings
              standings={standings}
              league="shl"
              teamCode1={teamCode}
              teamCode2={game ? (game.homeTeamInfo.teamInfo.code === teamCode ? game.awayTeamInfo.teamInfo.code : game.homeTeamInfo.teamInfo.code) : teamCode}
            />
          </div>
        )}

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
