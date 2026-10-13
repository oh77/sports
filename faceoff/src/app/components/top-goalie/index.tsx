'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  LeadersLoading,
  LeadersSection,
} from '@/app/components/top-player/leaders-section';
import {
  fetchTeamGoalies,
  GOALIES_PER_TEAM,
} from '@/app/components/top-players/teamLeaders';
import { useSeason } from '@/app/utils/useSeason';
import type { GoalieStats } from '../../types/domain/goalie-stats';
import { PlayerCard } from '../player-card';

interface TopGoalieProps {
  league: string;
  teamCode: string;
  /** How many of the team's goalies to list. */
  count?: number;
}

/** A team's most-used goalies, under a "Målvakter" heading. */
export const TopGoalie: React.FC<TopGoalieProps> = ({
  league,
  teamCode,
  count = GOALIES_PER_TEAM,
}) => {
  const season = useSeason();
  const [goalies, setGoalies] = useState<GoalieStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTeamGoalies(league, season, teamCode, count).then((top) => {
      if (!active) return;
      setGoalies(top);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [league, teamCode, season, count]);

  if (loading) return <LeadersLoading rows={count} />;
  if (goalies.length === 0) return null;

  return (
    <LeadersSection title="Målvakter">
      {goalies.map((goalie) => (
        <PlayerCard
          bare
          key={goalie.info.uuid}
          playerName={goalie.info.fullName}
          playerNumber={goalie.info.number}
          primaryValue={`${goalie.SVSPerc} %`}
          secondaryValue={goalie.GAA}
          rank={goalie.Rank}
          nationality={goalie.info.nationality}
        />
      ))}
    </LeadersSection>
  );
};
