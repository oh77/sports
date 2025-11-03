'use client';

import type React from 'react';
import { TopGoalies } from '../top-goalies';
import { TopScorer } from '../top-scorer';

interface TopPlayersProps {
  teamCode1: string;
  teamCode2: string;
  league: string;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({
  teamCode1,
  teamCode2,
  league,
}) => {
  return (
    <div className="max-w-6xl mx-auto mb-8 space-y-2">
      <TopScorer teamCode1={teamCode1} teamCode2={teamCode2} league={league} />
      <TopGoalies teamCode1={teamCode1} teamCode2={teamCode2} league={league} />
    </div>
  );
};
