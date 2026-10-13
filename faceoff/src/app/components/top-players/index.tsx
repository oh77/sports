'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useSeason } from '@/app/utils/useSeason';
import type { GoalieStats } from '../../types/domain/goalie-stats';
import type { PlayerStats } from '../../types/domain/player-stats';
import { PlayerCard } from '../player-card';
import { fetchTeamGoalies, fetchTeamScorers } from './teamLeaders';

interface TopPlayersProps {
  /** Shown in the left column. */
  teamCode1: string;
  teamCode2: string;
  league: string;
}

type TeamLeaders = { scorers: PlayerStats[]; goalies: GoalieStats[] };

/**
 * Both teams' top scorer and best goalie, side by side on one row each — on
 * phones too.
 */
export const TopPlayers: React.FC<TopPlayersProps> = ({
  teamCode1,
  teamCode2,
  league,
}) => {
  const season = useSeason();
  const [teams, setTeams] = useState<[TeamLeaders, TeamLeaders] | null>(null);

  useEffect(() => {
    let active = true;
    setTeams(null);
    const load = async (code: string): Promise<TeamLeaders> => {
      const [scorers, goalies] = await Promise.all([
        fetchTeamScorers(league, season, code, 1),
        fetchTeamGoalies(league, season, code, 1),
      ]);
      return { scorers, goalies };
    };
    Promise.all([load(teamCode1), load(teamCode2)]).then(([team1, team2]) => {
      if (active) setTeams([team1, team2]);
    });
    return () => {
      active = false;
    };
  }, [teamCode1, teamCode2, league, season]);

  if (!teams) {
    return (
      <div
        className="max-w-6xl mx-auto mb-8 animate-pulse space-y-2"
        aria-hidden="true"
      >
        {['scorer', 'goalie'].map((row) => (
          <div key={row} className="grid grid-cols-2 gap-2 md:gap-8">
            <div className="h-[58px] rounded-lg bg-surface" />
            <div className="h-[58px] rounded-lg bg-surface" />
          </div>
        ))}
      </div>
    );
  }

  const [team1, team2] = teams;
  const hasScorers = team1.scorers.length > 0 || team2.scorers.length > 0;
  const hasGoalies = team1.goalies.length > 0 || team2.goalies.length > 0;
  if (!hasScorers && !hasGoalies) return null;

  return (
    <div className="max-w-6xl mx-auto mb-8 space-y-6">
      <div className="grid grid-cols-2 gap-2 border-b border-line-soft pb-2 md:gap-8">
        <TeamName leaders={team1} fallback={teamCode1} />
        <TeamName leaders={team2} fallback={teamCode2} />
      </div>

      {hasScorers && (
        <PairedRows
          title="Poängliga"
          left={team1.scorers}
          right={team2.scorers}
          render={(player) => (
            <PlayerCard
              key={player.info.uuid}
              compact
              playerName={player.info.fullName}
              shortName={player.info.lastName}
              playerNumber={player.info.number}
              primaryValue={`${player.TP} p`}
              secondaryValue={`${player.G} + ${player.A}`}
              rank={player.Rank}
              nationality={player.info.nationality}
            />
          )}
        />
      )}

      {hasGoalies && (
        <PairedRows
          title="Målvakter"
          left={team1.goalies}
          right={team2.goalies}
          render={(goalie) => (
            <PlayerCard
              key={goalie.info.uuid}
              compact
              playerName={goalie.info.fullName}
              shortName={goalie.info.lastName}
              playerNumber={goalie.info.number}
              primaryValue={`${goalie.SVSPerc} %`}
              secondaryValue={goalie.GAA}
              rank={goalie.Rank}
              nationality={goalie.info.nationality}
            />
          )}
        />
      )}
    </div>
  );
};

/** One stat's rows, the two teams' n:th best side by side. */
function PairedRows<T>({
  title,
  left,
  right,
  render,
}: {
  title: string;
  left: T[];
  right: T[];
  render: (item: T) => React.ReactNode;
}) {
  const rows = Math.max(left.length, right.length);
  return (
    <section className="space-y-2">
      <h2 className="display text-sm font-bold uppercase tracking-[0.08em] text-dim">
        {title}
      </h2>
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows are positions
        <div key={i} className="grid grid-cols-2 gap-2 md:gap-8">
          {left[i] ? render(left[i]) : <div />}
          {right[i] ? render(right[i]) : <div />}
        </div>
      ))}
    </section>
  );
}

/** Column heading; the feeds carry the club name on every player row. */
function TeamName({
  leaders,
  fallback,
}: {
  leaders: TeamLeaders;
  fallback: string;
}) {
  const name =
    leaders.scorers[0]?.info.team.name ||
    leaders.goalies[0]?.info.team.name ||
    fallback;
  return (
    <p className="display truncate text-sm font-bold uppercase tracking-[0.04em] text-ink md:text-base">
      {name}
    </p>
  );
}
