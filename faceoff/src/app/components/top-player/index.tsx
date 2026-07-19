'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { withSeason } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
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
  const season = useSeason();
  const [topPlayer, setTopPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPlayer = async () => {
      try {
        setLoading(true);

        const url = teamCode
          ? `/api/${league}-players?teamCode=${encodeURIComponent(teamCode)}`
          : `/api/${league}-players`;
        const response = await fetch(withSeason(url, season));

        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }

        const data: PlayerStatsData = await response.json();

        // Get top player (already sorted by points, rank applies)
        const top = data.stats && data.stats.length > 0 ? data.stats[0] : null;
        setTopPlayer(top);
      } catch (err) {
        // Player stats may be unavailable (e.g. early in a new season). Log for
        // diagnostics but stay silent for the user — the section just collapses.
        // Use console.warn (not error) so it doesn't trip the Next.js dev
        // error overlay.
        console.warn('Error fetching top player:', err);
        setTopPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayer();
  }, [league, teamCode, season]);

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

  if (!topPlayer) {
    return null;
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
        club={topPlayer.info.team.name}
      />
    </div>
  );
};
