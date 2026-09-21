'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { TeamForm } from '@/app/components/team-form';
import { buildTeamFormIndex } from '@/app/utils/teamForm';
import type { GameInfo } from '../../types/domain/game';

interface TrendMarkersProps {
  games: GameInfo[];
  homeTeamCode: string;
  awayTeamCode: string;
}

/**
 * The two sides' recent form above a hero game card: home to the left, away to
 * the right, each oldest to newest. A wider window than a listing row's, so
 * the run of a season reads here rather than just the last few nights.
 */
export const TrendMarkers: React.FC<TrendMarkersProps> = ({
  games,
  homeTeamCode,
  awayTeamCode,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const form = useMemo(() => buildTeamFormIndex(games), [games]);

  // Mobile: 7 games, Desktop: 10 games
  const limit = isMobile ? 7 : 10;

  const homeResults = form.formFor(homeTeamCode, limit);
  const awayResults = form.formFor(awayTeamCode, limit);

  // Hide if no games played
  if (homeResults.length === 0 && awayResults.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4">
      <div className="flex justify-between items-center px-2 md:px-4">
        {homeResults.length > 0 ? (
          <TeamForm entries={homeResults} size="md" align="start" />
        ) : (
          <div className="text-xs text-mute text-left">Inga matcher</div>
        )}
        {awayResults.length > 0 ? (
          <TeamForm entries={awayResults} size="md" align="end" />
        ) : (
          <div className="text-xs text-mute text-right">Inga matcher</div>
        )}
      </div>
    </div>
  );
};
