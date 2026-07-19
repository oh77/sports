'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { leagueMeta } from '@/app/theme/nhl';
import type {
  GoalieStats,
  GoalieStatsData,
} from '@/app/types/domain/goalie-stats';
import type { League } from '@/app/types/domain/league';
import type {
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import { withSeason } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';
import { PlayerCard } from '../player-card';

interface LeagueStatsProps {
  league: League;
}

/** STATISTIK page: league-wide top scorers and goalies. */
export function LeagueStats({ league }: LeagueStatsProps) {
  const season = useSeason();
  const [scorers, setScorers] = useState<PlayerStats[]>([]);
  const [goalies, setGoalies] = useState<GoalieStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [pRes, gRes] = await Promise.all([
          fetch(withSeason(`/api/${league}-players`, season)),
          fetch(withSeason(`/api/${league}-goalies`, season)),
        ]);
        if (!pRes.ok) throw new Error('players');
        const players: PlayerStatsData = await pRes.json();
        const topPlayers = [...players.stats]
          .sort((a, b) => b.TP - a.TP)
          .slice(0, 12);
        let topGoalies: GoalieStats[] = [];
        if (gRes.ok) {
          const goalieData: GoalieStatsData = await gRes.json();
          topGoalies = [...goalieData.stats]
            .sort((a, b) => Number(b.SVSPerc) - Number(a.SVSPerc))
            .slice(0, 6);
        }
        if (active) {
          setScorers(topPlayers);
          setGoalies(topGoalies);
        }
      } catch (err) {
        console.error('Failed to load league stats:', err);
        if (active) setError('Kunde inte ladda statistik');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [league, season]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
        {leagueMeta[league].name} · Statistik
      </h1>

      {error && <p className="text-dim">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              key={i}
              className="h-[52px] animate-pulse rounded-lg border border-line bg-surface"
            />
          ))}
        </div>
      ) : (
        <>
          <Section title="Poängliga">
            <div className="flex flex-col gap-2">
              {scorers.map((p) => (
                <PlayerCard
                  key={`${p.Player}-${p.info.uuid}`}
                  playerName={p.info.fullName}
                  playerNumber={p.info.number}
                  primaryValue={`${p.TP} p`}
                  secondaryValue={`${p.G}+${p.A}`}
                  rank={p.Rank}
                  nationality={p.info.nationality}
                  club={p.info.team.name}
                />
              ))}
            </div>
          </Section>

          {goalies.length > 0 && (
            <Section title="Målvakter">
              <div className="flex flex-col gap-2">
                {goalies.map((g) => (
                  <PlayerCard
                    key={`${g.Player}-${g.info.uuid}`}
                    playerName={g.info.fullName}
                    playerNumber={g.info.number}
                    primaryValue={`${g.SVSPerc}%`}
                    secondaryValue={`${g.GAA} GAA`}
                    rank={g.Rank}
                    nationality={g.info.nationality}
                    club={g.info.team.name}
                  />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.06em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
