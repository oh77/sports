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

interface TopGoaliesProps {
  teamCode1: string;
  teamCode2: string;
  league: string;
}

export const TopGoalies: React.FC<TopGoaliesProps> = ({
  teamCode1,
  teamCode2,
  league,
}) => {
  const season = useSeason();
  const [team1Goalies, setTeam1Goalies] = useState<GoalieStats[]>([]);
  const [team2Goalies, setTeam2Goalies] = useState<GoalieStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopGoalies = async () => {
      try {
        setLoading(true);

        if (league !== 'shl' && league !== 'sdhl' && league !== 'ha') {
          throw new Error(`Unsupported league: ${league}`);
        }

        // Fetch goalies for both teams using server-side API routes
        const [team1Response, team2Response] = await Promise.all([
          fetch(
            withSeason(`/api/${league}-goalies?teamCode=${teamCode1}`, season),
          ),
          fetch(
            withSeason(`/api/${league}-goalies?teamCode=${teamCode2}`, season),
          ),
        ]);

        if (!team1Response.ok || !team2Response.ok) {
          throw new Error('Failed to fetch goalie data');
        }

        const team1Data: GoalieStatsData = await team1Response.json();
        const team2Data: GoalieStatsData = await team2Response.json();

        // Get top goalie from each team (sorted by save percentage)
        const team1GoaliesFiltered = (team1Data.stats || []).slice(0, 1);

        const team2GoaliesFiltered = (team2Data.stats || []).slice(0, 1);

        setTeam1Goalies(team1GoaliesFiltered);
        setTeam2Goalies(team2GoaliesFiltered);
      } catch (err) {
        console.error('Error fetching top goalies:', err);
        setError('Failed to load goalie statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopGoalies();
  }, [teamCode1, teamCode2, league, season]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-surface-3 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-surface-3 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-loss/10 border border-loss/30 rounded-lg p-4 text-center">
        <p className="text-loss">{error}</p>
      </div>
    );
  }

  if (team1Goalies.length === 0 && team2Goalies.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Team 1 Top Goalie */}
      <div className="space-y-4">
        {team1Goalies.map((goalie) => (
          <PlayerCard
            key={goalie.info.uuid}
            playerName={goalie.info.fullName}
            playerNumber={goalie.info.number}
            primaryValue={`${goalie.SVSPerc} %`}
            secondaryValue={goalie.GAA}
            rank={goalie.Rank}
            nationality={goalie.info.nationality}
            club={goalie.info.team.name}
          />
        ))}
      </div>

      {/* Team 2 Top Goalie */}
      <div className="space-y-4">
        {team2Goalies.map((goalie) => (
          <PlayerCard
            key={goalie.info.uuid}
            playerName={goalie.info.fullName}
            playerNumber={goalie.info.number}
            primaryValue={`${goalie.SVSPerc} %`}
            secondaryValue={goalie.GAA}
            rank={goalie.Rank}
            nationality={goalie.info.nationality}
            club={goalie.info.team.name}
          />
        ))}
      </div>
    </div>
  );
};
