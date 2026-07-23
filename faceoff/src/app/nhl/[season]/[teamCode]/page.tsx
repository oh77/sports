'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import GameStatsContainer from '../../../components/gamestats-container';
import NextGame from '../../../components/next-game';
import PreviousGames from '../../../components/previous-games';
import { CompactStandings } from '../../../components/standings/compact-standings';
import { TopGoalie } from '../../../components/top-goalie';
import { TopPlayer } from '../../../components/top-player';
import UpcomingGames from '../../../components/upcoming-games';
import { NHL_TEAMS } from '../../../config/nhlTeams';
import type { GameInfo, LeagueResponse } from '../../../types/domain/game';
import type { StandingsData } from '../../../types/domain/standings';
import type { TeamInfo } from '../../../types/domain/team';
import { leagueBasePath, withSeason } from '../../../utils/leaguePaths';

export default function NhlTeamPage({
  params,
}: {
  params: Promise<{ season: string; teamCode: string }>;
}) {
  const resolvedParams = React.use(params);
  const season = resolvedParams.season;
  const teamCode = decodeURIComponent(resolvedParams.teamCode);

  const [game, setGame] = useState<GameInfo | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [allGames, setAllGames] = useState<GameInfo[]>([]);
  const [previousGames, setPreviousGames] = useState<GameInfo[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<GameInfo[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);

        // The club is a static config entry; the abbrev is the URL code.
        const foundTeam = NHL_TEAMS.find(
          (t) => t.code.toUpperCase() === teamCode.toUpperCase(),
        );
        if (!foundTeam) {
          setError('Lag inte hittat');
          return;
        }
        setTeamInfo(foundTeam);

        // The whole season for this club in one call.
        const gamesResponse = await fetch(
          withSeason(
            `/api/nhl-games?type=team&teamCode=${encodeURIComponent(foundTeam.code)}`,
            season,
          ),
        );
        if (!gamesResponse.ok) {
          throw new Error(`Failed to fetch games: ${gamesResponse.status}`);
        }
        const gamesData: LeagueResponse = await gamesResponse.json();
        const teamGames = gamesData.gameInfo || [];
        setAllGames(teamGames);

        const now = new Date();
        const todayString = now.toISOString().split('T')[0];
        const dayOf = (g: GameInfo) =>
          new Date(g.startDateTime).toISOString().split('T')[0];
        const asc = (a: GameInfo, b: GameInfo) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime();

        // Next game: today's earliest, else the next not-started game.
        const todaysGames = teamGames.filter((g) => dayOf(g) === todayString);
        const nextGame =
          todaysGames.length > 0
            ? [...todaysGames].sort(asc)[0]
            : teamGames
                .filter(
                  (g) =>
                    g.state === 'not-started' &&
                    new Date(g.startDateTime) > now,
                )
                .sort(asc)[0];
        setGame(nextGame ?? null);

        setPreviousGames(
          teamGames
            .filter((g) => g.state === 'finished' && dayOf(g) !== todayString)
            .sort((a, b) => asc(b, a))
            .slice(0, 3),
        );

        setUpcomingGames(
          teamGames
            .filter(
              (g) =>
                g.state === 'not-started' &&
                dayOf(g) !== todayString &&
                g.uuid !== nextGame?.uuid,
            )
            .sort(asc)
            .slice(0, 3),
        );

        try {
          const standingsResponse = await fetch(
            withSeason('/api/nhl-standings', season),
          );
          if (standingsResponse.ok) {
            setStandings(await standingsResponse.json());
          }
        } catch (err) {
          console.error('Failed to load standings:', err);
        }
      } catch (err) {
        setError('Misslyckades att ladda lagdata');
        console.error('NHL Team Page Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamCode) {
      loadTeamData();
    }
  }, [teamCode, season]);

  if (loading) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-3 rounded mb-8 w-1/3 mx-auto"></div>
            <div className="h-64 bg-surface rounded mb-4"></div>
            <div className="h-4 bg-surface-3 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !teamInfo) {
    return (
      <main className="relative py-6 md:py-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-loss text-6xl mb-4">⚠️</div>
            <h1 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-4">
              {error || 'Inget lag hittat'}
            </h1>
            <p className="text-dim mb-6">
              {error || `Ingen data hittades för lagkod: ${teamCode}`}
            </p>
            <Link
              href={leagueBasePath('nhl', season)}
              className="display inline-block rounded-lg bg-accent px-6 py-3 font-bold uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-90"
            >
              Tillbaka till NHL
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const opponentCode = game
    ? game.homeTeamInfo.teamInfo.code === teamInfo.code
      ? game.awayTeamInfo.teamInfo.code
      : game.homeTeamInfo.teamInfo.code
    : undefined;

  return (
    <main className="relative py-6 md:py-8">
      {/* Background Team Logo */}
      <div
        className="absolute inset-0 flex items-center justify-center z-0 px-8"
        aria-hidden="true"
      >
        <div className="opacity-[0.05] w-full h-full flex items-center justify-center">
          <Image
            src={teamInfo.logo || '/placeholder-team.png'}
            alt=""
            width={400}
            height={400}
            className="w-96 h-96 object-contain transform rotate-12"
            role="presentation"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-3 rounded-full flex items-center justify-center">
            <Image
              src={teamInfo.logo || '/placeholder-team.png'}
              alt={`${teamInfo.full} logo`}
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="display text-3xl md:text-5xl font-bold text-ink uppercase tracking-[0.04em] text-center md:text-left">
            {teamInfo.full}
          </h1>
        </div>

        <NextGame
          game={game}
          currentTeamCode={teamInfo.code}
          league="nhl"
          allGames={allGames}
        />

        {game && (
          <div className="max-w-6xl mx-auto mb-8">
            <GameStatsContainer allGames={allGames} currentGame={game} />
          </div>
        )}

        {/* Top scorer + goalie for this team, plus the opponent when there's
            a next game. Not gated on a game, so completed seasons show them. */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-1 gap-6">
              <TopPlayer league="nhl" teamCode={teamInfo.code} />
              <TopGoalie league="nhl" teamCode={teamInfo.code} />
            </div>
            {opponentCode && (
              <div className="grid grid-cols-1 gap-6">
                <TopPlayer league="nhl" teamCode={opponentCode} />
                <TopGoalie league="nhl" teamCode={opponentCode} />
              </div>
            )}
          </div>
        </div>

        {standings && (
          <div className="max-w-6xl mx-auto mt-8">
            <CompactStandings
              standings={standings}
              league="nhl"
              teamCode={teamInfo.code}
              opponentTeamCode={opponentCode}
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PreviousGames
              games={previousGames}
              currentTeamCode={teamInfo.code}
              league="nhl"
            />
            <UpcomingGames
              games={upcomingGames}
              currentTeamCode={teamInfo.code}
              league="nhl"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
