'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type {
  PlayerStats,
  PlayerStatsData,
} from '../../types/domain/player-stats';
import { PlayerCard } from '../player-card';

interface TopPlayerProps {
  league: string;
  teamCode?: string;
}

export const TopPlayer: React.FC<TopPlayerProps> = ({ league, teamCode }) => {
  const [topPlayer, setTopPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPlayer = async () => {
      try {
        setLoading(true);

        const url = teamCode
          ? `/api/${league}-players?teamCode=${encodeURIComponent(teamCode)}`
          : `/api/${league}-players`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const data: PlayerStatsData = await response.json();

        console.log('TopPlayer data:', data);
        console.log('TopPlayer stats:', data.stats);

        // Get top player (already sorted by points, rank applies)
        const top = data.stats && data.stats.length > 0 ? data.stats[0] : null;

        console.log('Top player:', top);
        setTopPlayer(top);
      } catch (err) {
        console.error('Error fetching top player:', err);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayer();
  }, [league, teamCode]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!topPlayer) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">No player data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlayerCard
        key={topPlayer.info.uuid}
        playerName={topPlayer.info.fullName}
        playerNumber={topPlayer.info.number}
        primaryValue={`${topPlayer.TP} p`}
        secondaryValue={`${topPlayer.G} + ${topPlayer.A}`}
        rank={topPlayer.Rank}
        nationality={topPlayer.info.nationality}
      />
    </div>
  );
};
