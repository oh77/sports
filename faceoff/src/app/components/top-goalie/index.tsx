'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { withSeason } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
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
  const season = useSeason();
  const [topGoalie, setTopGoalie] = useState<GoalieStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopGoalie = async () => {
      try {
        setLoading(true);

        const url = teamCode
          ? `/api/${league}-goalies?teamCode=${encodeURIComponent(teamCode)}`
          : `/api/${league}-goalies`;
        const response = await fetch(withSeason(url, season));

        if (!response.ok) {
          throw new Error('Failed to fetch goalie data');
        }

        const data: GoalieStatsData = await response.json();

        // Get top goalie (already sorted by SVS%, rank applies)
        const top = data.stats && data.stats.length > 0 ? data.stats[0] : null;
        setTopGoalie(top);
      } catch (err) {
        // Goalie stats may be unavailable (e.g. early in a new season). Warn for
        // diagnostics but stay silent for the user — the section collapses.
        console.warn('Error fetching top goalie:', err);
        setTopGoalie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTopGoalie();
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

  if (!topGoalie) {
    return null;
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
        club={topGoalie.info.team.name}
      />
    </div>
  );
};
