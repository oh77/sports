'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  fetchTeamScorers,
  SCORERS_PER_TEAM,
} from '@/app/components/top-players/teamLeaders';
import { useSeason } from '@/app/utils/useSeason';
import type { PlayerStats } from '../../types/domain/player-stats';
import { PlayerCard } from '../player-card';
import { LeadersLoading, LeadersSection } from './leaders-section';

interface TopPlayerProps {
  league: string;
  teamCode: string;
  /** How many of the team's scorers to list. */
  count?: number;
}

/** A team's top scorers by points, under a "Poängliga" heading. */
export const TopPlayer: React.FC<TopPlayerProps> = ({
  league,
  teamCode,
  count = SCORERS_PER_TEAM,
}) => {
  const season = useSeason();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTeamScorers(league, season, teamCode, count).then((top) => {
      if (!active) return;
      setPlayers(top);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [league, teamCode, season, count]);

  if (loading) return <LeadersLoading rows={count} />;
  if (players.length === 0) return null;

  return (
    <LeadersSection title="Poängliga">
      {players.map((player) => (
        <PlayerCard
          bare
          key={player.info.uuid}
          playerName={player.info.fullName}
          playerNumber={player.info.number}
          primaryValue={`${player.TP} p`}
          secondaryValue={`${player.G} + ${player.A}`}
          rank={player.Rank}
          nationality={player.info.nationality}
        />
      ))}
    </LeadersSection>
  );
};
