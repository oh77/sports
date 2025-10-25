'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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

          console.log(`teamCode1: ${teamCode1}`);
          console.log(`teamCode2: ${teamCode2}`);

        // Fetch players for both teams
        const [team1Response, team2Response] = await Promise.all([
          fetch(`/api/${league}-players?teamCode=${teamCode1}&count=5`),
          fetch(`/api/${league}-players?teamCode=${teamCode2}&count=5`)
        ]);

        if (!team1Response.ok || !team2Response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const team1Data: PlayerStatsData = await team1Response.json();
        const team2Data: PlayerStatsData = await team2Response.json();

          console.log(team1Data);
          console.log('=== === ===');

          console.log(team2Data);
        // Get top players from each team (sorted by total points)
        // Show only 1 player per team for all leagues
        const playerCount = 1;

        const topTeam1Players = team1Data.stats
          .sort((a, b) => b.TP - a.TP)
          .slice(0, playerCount)
          .map((player, index) => ({ ...player, Rank: index + 1 }));

        const topTeam2Players = team2Data.stats
          .sort((a, b) => b.TP - a.TP)
          .slice(0, playerCount)
          .map((player, index) => ({ ...player, Rank: index + 1 }));

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

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Team 1 Top Players */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-0">
            {team1Players.map((player) => (
              <div key={player.info.uuid} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {player.info.playerMedia?.mediaString ? (
                    <Image
                      src={`https://sportality.cdn.s8y.se/${player.info.playerMedia.mediaString.split('|')[2]}`}
                      alt={player.info.fullName}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xl">🏒</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-lg">{player.info.fullName}</h4>
                    <span className="text-sm text-gray-500">#{player.info.number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{player.info.position}</span>
                    <span className="font-semibold text-blue-600 text-lg">{player.TP} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{player.G}G {player.A}A</span>
                    <span>{player.info.nationality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Top Players */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-0">
            {team2Players.map((player) => (
              <div key={player.info.uuid} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {player.info.playerMedia?.mediaString ? (
                    <Image
                      src={`https://sportality.cdn.s8y.se/${player.info.playerMedia.mediaString.split('|')[2]}`}
                      alt={player.info.fullName}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xl">🏒</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-lg">{player.info.fullName}</h4>
                    <span className="text-sm text-gray-500">#{player.info.number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{player.info.position}</span>
                    <span className="font-semibold text-blue-600 text-lg">{player.TP} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{player.G}G {player.A}A</span>
                    <span>{player.info.nationality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
