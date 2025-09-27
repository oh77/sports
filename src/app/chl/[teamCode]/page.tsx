'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CHLGame, CHLTeamInfo } from '../../types/chl';
import { getTeamLogoWithFallback } from '../../utils/teamLogos';
import NextGame from '../../components/next-game';
import PreviousGames from '../../components/previous-games';
import UpcomingGames from '../../components/upcoming-games';
import { GameInfo } from '../../types/game';


export default function TeamPage({ params }: { params: Promise<{ teamCode: string }> }) {
  const resolvedParams = React.use(params);
  const teamCode = decodeURIComponent(resolvedParams.teamCode);
  const [game, setGame] = useState<CHLGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<CHLTeamInfo | null>(null);
  const [previousGames, setPreviousGames] = useState<CHLGame[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<CHLGame[]>([]);
  const [standings, setStandings] = useState<unknown>(null);
  const [allTeams, setAllTeams] = useState<CHLTeamInfo[]>([]);

  // Helper function to match team code with short name
  const matchTeamCode = (teamCode: string, teamShortName: string): boolean => {
    return teamShortName.toUpperCase() === teamCode.toUpperCase();
  };

  // Convert CHL game to GameInfo format for components
  const convertCHLGameToGameInfo = (chlGame: CHLGame): GameInfo => {
    const homeTeamLogo = getTeamLogoWithFallback({
      shortName: chlGame.homeTeam.shortName,
      externalId: chlGame.homeTeam.externalId,
      country: chlGame.homeTeam.country ? { code: chlGame.homeTeam.country } : undefined
    });
    
    const awayTeamLogo = getTeamLogoWithFallback({
      shortName: chlGame.awayTeam.shortName,
      externalId: chlGame.awayTeam.externalId,
      country: chlGame.awayTeam.country ? { code: chlGame.awayTeam.country } : undefined
    });

    return {
      uuid: chlGame.id,
      startDateTime: chlGame.startDate,
      state: chlGame.state,
      homeTeamInfo: {
        code: chlGame.homeTeam.shortName,
        names: {
          short: chlGame.homeTeam.shortName,
          long: chlGame.homeTeam.name,
          full: chlGame.homeTeam.name,
          code: chlGame.homeTeam.shortName
        },
        teamNames: {
          short: chlGame.homeTeam.shortName,
          long: chlGame.homeTeam.name,
          full: chlGame.homeTeam.name,
          code: chlGame.homeTeam.shortName
        },
        icon: homeTeamLogo,
        logo: homeTeamLogo,
        score: chlGame.scores?.home || 0
      },
      awayTeamInfo: {
        code: chlGame.awayTeam.shortName,
        names: {
          short: chlGame.awayTeam.shortName,
          long: chlGame.awayTeam.name,
          full: chlGame.awayTeam.name,
          code: chlGame.awayTeam.shortName
        },
        teamNames: {
          short: chlGame.awayTeam.shortName,
          long: chlGame.awayTeam.name,
          full: chlGame.awayTeam.name,
          code: chlGame.awayTeam.shortName
        },
        icon: awayTeamLogo,
        logo: awayTeamLogo,
        score: chlGame.scores?.away || 0
      },
      venueInfo: {
        name: chlGame.venue
      }
    };
  };

  // Convert arrays of CHL games to GameInfo arrays
  const convertCHLGamesToGameInfo = (chlGames: CHLGame[]): GameInfo[] => {
    return chlGames.map(convertCHLGameToGameInfo);
  };

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch CHL games and teams - use all games to get complete data
        const [upcomingGamesResponse, recentGamesResponse, teamsResponse] = await Promise.all([
          fetch('/api/chl-games?type=all-upcoming'),
          fetch('/api/chl-games?type=all-recent'),
          fetch('/api/chl-teams')
        ]);

        if (!upcomingGamesResponse.ok) {
          throw new Error(`Failed to fetch upcoming games: ${upcomingGamesResponse.status}`);
        }
        if (!recentGamesResponse.ok) {
          throw new Error(`Failed to fetch recent games: ${recentGamesResponse.status}`);
        }
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
        }

        const upcomingGamesData = await upcomingGamesResponse.json();
        const recentGamesData = await recentGamesResponse.json();
        const teamsData = await teamsResponse.json();
        
        const allGames = [...(recentGamesData.games || []), ...(upcomingGamesData.games || [])];
        const teams = teamsData.data || [];
        
        // Store all teams for footer
        setAllTeams(teams);

        // Find the team by matching the team code with team short names
        const foundTeam = teams.find((team: CHLTeamInfo) => 
          matchTeamCode(teamCode, team.shortName)
        );

        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }

        setTeamInfo(foundTeam);

        // Find games for this team
        const teamGames = allGames.filter((game: CHLGame) => 
          game.homeTeam.shortName === foundTeam.shortName || game.awayTeam.shortName === foundTeam.shortName
        );

        // Debug logging to see what games we have
        console.log('All games:', allGames.map(g => ({ id: g.id, status: g.status, date: g.startDate })));
        console.log(`Found ${teamGames.length} total games for team ${foundTeam.shortName}`);
        console.log('Game statuses:', teamGames.map(g => ({ id: g.id, status: g.status, date: g.startDate })));

        // Find next game - get the chronologically next game for this team
        const now = new Date();
        const nextGame = teamGames
          .filter((game: CHLGame) => game.status === 'not-started' && new Date(game.startDate) > now)
          .sort((a: CHLGame, b: CHLGame) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

        setGame(nextGame || null);

        // Get previous and upcoming games
        const previous = teamGames
          .filter((game: CHLGame) => game.status === 'finished')
          .sort((a: CHLGame, b: CHLGame) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5); // Show up to 5 previous games

        const upcoming = teamGames
          .filter((game: CHLGame) => game.status === 'not-started' && game.id !== nextGame?.id)
          .sort((a: CHLGame, b: CHLGame) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5); // Show up to 5 upcoming games (excluding the next game)

        setPreviousGames(previous);
        setUpcomingGames(upcoming);

        // Load standings data
        try {
          const standingsResponse = await fetch('/api/chl-standings');
          if (standingsResponse.ok) {
            const standingsData = await standingsResponse.json();
            setStandings(standingsData);
          }
        } catch (err) {
          console.error('Failed to load standings:', err);
        }

      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error('CHL Team Page Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamCode) {
      loadTeamData();
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

  if (error || !teamInfo) {
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
              href="/chl" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tillbaka till CHL
            </Link>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-gray-100 py-12 relative">
      {/* Background Team Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-0 px-8">
        <div className="opacity-10 w-full h-full flex items-center justify-center">
          <span className="text-9xl">🏒</span>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Row */}
        <div className="flex items-center justify-center gap-6 mb-8 py-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Image
              src={getTeamLogoWithFallback({
                shortName: teamInfo.shortName,
                externalId: teamInfo.externalId,
                country: teamInfo.country ? { code: teamInfo.country.code } : undefined
              })}
              alt={`${teamInfo.name} logo`}
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 uppercase tracking-wider">
            {teamInfo.name}
          </h1>
        </div>

        <NextGame 
          game={game ? convertCHLGameToGameInfo(game) : null} 
          currentTeamCode={teamCode} 
          league="chl" 
        />

        {/* Previous and Upcoming Games */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PreviousGames 
              games={convertCHLGamesToGameInfo(previousGames)} 
              currentTeamCode={teamCode} 
              league="chl" 
            />

            <UpcomingGames 
              games={convertCHLGamesToGameInfo(upcomingGames)} 
              currentTeamCode={teamCode} 
              league="chl" 
            />
          </div>
        </div>

        {/* Teams Footer */}
        {allTeams.length > 0 && (
          <footer className="bg-gray-800 py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                {[
                  // CHL league logo as first item
                  {
                    key: 'league-chl',
                    href: '/chl',
                    logo: 'https://www.chl.hockey/static/img/logo.png',
                    alt: 'CHL Logo',
                    tooltip: 'CHL',
                    isLeague: true
                  },
                  // Team logos
                  ...allTeams.map((team) => ({
                    key: `team-${team.shortName}`,
                    href: `/chl/${team.shortName.toUpperCase()}`,
                    logo: getTeamLogoWithFallback({
                      shortName: team.shortName,
                      externalId: team.externalId,
                      country: team.country ? { code: team.country.code } : undefined
                    }),
                    alt: `${team.name} logo`,
                    tooltip: team.name,
                    isCurrentTeam: team.shortName.toUpperCase() === teamCode.toUpperCase(),
                    isLeague: false
                  }))
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`group relative transition-all duration-200 ${
                      'isCurrentTeam' in item && item.isCurrentTeam 
                        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' 
                        : 'hover:scale-110'
                    }`}
                  >
                    <div className={`w-12 h-12 ${item.isLeague ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center overflow-hidden`}>
                      <Image
                        src={item.logo}
                        alt={item.alt}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.tooltip}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
