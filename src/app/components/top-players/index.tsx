'use client';

import React, { useEffect, useState } from 'react';
import { PlayerStats, PlayerStatsData } from '../../types/domain/player-stats';
import { PlayerCard } from '../player-card';

interface TopPlayersProps {
  teamCode1: string;
  teamCode2: string;
  league: string;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ teamCode1, teamCode2, league }) => {
  const [team1Players, setTeam1Players] = useState<PlayerStats[]>([]);
  const [team2Players, setTeam2Players] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setLoading(true);

        // Fetch players for both teams
        const [team1Response, team2Response] = await Promise.all([
          fetch(`/api/${league}-players?teamCode=${teamCode1}`),
          fetch(`/api/${league}-players?teamCode=${teamCode2}`)
        ]);

        if (!team1Response.ok || !team2Response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const team1Data: PlayerStatsData = await team1Response.json();
        const team2Data: PlayerStatsData = await team2Response.json();

        console.log(team1Data.stats, '===' , team2Data.stats);

        // Get top players from each team (sorted by total points)
        // Show only 1 player per team for all leagues
        const playerCount = 1;

        const topTeam1Players = team1Data.stats
          .sort((a, b) => b.TP - a.TP)
          .slice(0, playerCount);

        const topTeam2Players = team2Data.stats
          .sort((a, b) => b.TP - a.TP)
          .slice(0, playerCount);

        setTeam1Players(topTeam1Players);
        setTeam2Players(topTeam2Players);
      } catch (err) {
        console.error('Error fetching top players:', err);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, [teamCode1, teamCode2, league]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (team1Players.length === 0 && team2Players.length === 0) {
    return null;
  }

  const getPlayerImageUrl = (player: PlayerStats): string => {
    if (player.info.playerMedia?.mediaString) {
      return `https://sportality.cdn.s8y.se/${player.info.playerMedia.mediaString.split('|')[2]}`;
    }
    return '/placeholder-player.png'; // Fallback image
  };

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Team 1 Top Players */}
        <div className="space-y-4">
          {team1Players.map((player) => (
            <PlayerCard
              key={player.info.uuid}
              imageUrl={getPlayerImageUrl(player)}
              playerName={player.info.fullName}
              playerNumber={player.info.number}
              primaryValue={`${player.TP} p`}
              secondaryValue={`${player.G} + ${player.A}`}
              rank={player.Rank}
              nationality={player.info.nationality}
            />
          ))}
        </div>

        {/* Team 2 Top Players */}
        <div className="space-y-4">
          {team2Players.map((player) => (
            <PlayerCard
              key={player.info.uuid}
              imageUrl={getPlayerImageUrl(player)}
              playerName={player.info.fullName}
              playerNumber={player.info.number}
              primaryValue={`${player.TP} p`}
              secondaryValue={`${player.G} + ${player.A}`}
              rank={player.Rank}
              nationality={player.info.nationality}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
