'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type {
  GoalieStats,
  GoalieStatsData,
} from '../../types/domain/goalie-stats';
import { PlayerCard } from '../player-card';

interface TopGoalieProps {
  league: string;
  teamCode?: string;
}

export const TopGoalie: React.FC<TopGoalieProps> = ({ league, teamCode }) => {
  const [topGoalie, setTopGoalie] = useState<GoalieStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopGoalie = async () => {
      try {
        setLoading(true);

        const url = teamCode
          ? `/api/${league}-goalies?teamCode=${encodeURIComponent(teamCode)}`
          : `/api/${league}-goalies`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch goalie data');
        }

        const data: GoalieStatsData = await response.json();

        console.log('TopGoalie data:', data);
        console.log('TopGoalie stats:', data.stats);

        // Get top goalie (already sorted by SVS%, rank applies)
        const top = data.stats && data.stats.length > 0 ? data.stats[0] : null;

        console.log('Top goalie:', top);
        setTopGoalie(top);
      } catch (err) {
        console.error('Error fetching top goalie:', err);
        setError('Failed to load goalie statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopGoalie();
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

  if (!topGoalie) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">No goalie data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlayerCard
        key={topGoalie.info.uuid}
        playerName={topGoalie.info.fullName}
        playerNumber={topGoalie.info.number}
        primaryValue={`${topGoalie.SVSPerc} %`}
        secondaryValue={topGoalie.GAA}
        rank={topGoalie.Rank}
        nationality={topGoalie.info.nationality}
      />
    </div>
  );
};
