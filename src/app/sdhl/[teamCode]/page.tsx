'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StatnetService } from '../../services/statnetService';
import PreviousGames from '../../components/previous-games';
import UpcomingGames from '../../components/upcoming-games';
import NextGame from '../../components/next-game';
import LeagueFooter from '../../components/league-footer';
import { CompactStandings } from '../../components/standings/compact-standings';
import { HeadToHead } from '../../components/head-to-head';
import { GameInfo, GameTeamInfo } from '../../types/domain/game';
import { StandingsData } from '../../types/domain/standings';
import GameStatsContainer from "@/app/components/gamestats-container";

export default function SDHLTeamPage({ params }: { params: Promise<{ teamCode: string }> }) {
  const resolvedParams = React.use(params);
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [teamInfo, setTeamInfo] = useState<GameTeamInfo | null>(null);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        const leagueService = new StatnetService('sdhl');

        // Fetch games from API (cached server-side)
        const games = await leagueService.fetchGames();
        setAllGames(games);

        if (games.length === 0) {
          setError('Ingen matchdata tillgänglig');
          return;
        }

        // Find team info from any game
        const teamGame = games.find(game =>
          game.homeTeamInfo.teamInfo.code === teamCode ||
          game.awayTeamInfo.teamInfo.code === teamCode
        );

        if (!teamGame) {
          setError('Lag inte hittat');
          return;
        }

        // Set team info
        const isHomeTeam = teamGame.homeTeamInfo.teamInfo.code === teamCode;
        const team = isHomeTeam ? teamGame.homeTeamInfo : teamGame.awayTeamInfo;
        setTeamInfo(team);

        // Get next game
        const next = leagueService.getNextGameForTeam(teamCode);
        setGame(next);

        // Get previous and upcoming games
        const prev = leagueService.getPreviousGamesForTeam(teamCode, 3);
        const upcoming = leagueService.getUpcomingGamesForTeam(teamCode, 3);

        setPreviousGames(prev);
        setUpcomingGames(upcoming);

        // Load standings data
        try {
          const standingsResponse = await fetch('/api/sdhl-standings');
          if (standingsResponse.ok) {
            const standingsData = await standingsResponse.json();
            setStandings(standingsData);
          }
        } catch (err) {
          console.error('Failed to load standings:', err);
        }

      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamCode]);


  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        {/* Background Team Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
          <div className="w-full h-full bg-gray-300 rounded animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-8 md:h-12 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>

          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !teamInfo) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {error || 'Lag Inte Hittat'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || `Lag "${teamCode}" kunde inte hittas`}
            </p>
            <Link
              href="/sdhl"
              className="bg-blue-500 hover:bg-blue-600 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till SDHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background Team Logo */}
      {teamInfo.teamInfo.logo && (
        <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
          <Image
            src={teamInfo.teamInfo.logo}
            alt={`${teamInfo.teamInfo.short} Background`}
            width={1200}
            height={1200}
            className="opacity-10 w-full h-full object-contain"
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg" style={{ backgroundColor: 'rgba(24,29,38,1)' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center">
            {teamInfo.teamInfo.logo ? (
              <Image
                src={teamInfo.teamInfo.logo}
                alt={teamInfo.teamInfo.short}
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xl md:text-2xl">🏒</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider text-center md:text-left">
            {teamInfo.teamInfo.full}
          </h1>
        </div>

        <NextGame
          game={game}
          currentTeamCode={teamCode}
          league="sdhl"
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

          {game && (
              <div className="max-w-6xl mx-auto mb-8">
                  <GameStatsContainer allGames={allGames} currentGame={game} />
              </div>
          )}

        {/* Compact Standings */}
        {standings && (
          <div className="max-w-6xl mx-auto mb-8">
            <CompactStandings
              standings={standings}
              league="sdhl"
              teamCode={teamCode}
              opponentTeamCode={game ? (game.homeTeamInfo.teamInfo.code === teamCode ? game.awayTeamInfo.teamInfo.code : game.homeTeamInfo.teamInfo.code) : undefined}
            />
          </div>
        )}

        {/* Previous and Upcoming Games */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PreviousGames
            games={previousGames}
            currentTeamCode={teamCode}
            league="sdhl"
          />
          <UpcomingGames
            games={upcomingGames}
            currentTeamCode={teamCode}
            league="sdhl"
          />
        </div>

        <LeagueFooter league="sdhl" currentTeamCode={teamCode} />
      </div>
    </main>
  );
}
