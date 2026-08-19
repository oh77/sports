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

/** A selectable nationality filter, e.g. `{ code: 'SE', label: 'Svenskar' }`. */
export interface NationalityFilter {
  /** ISO 3166-1 alpha-2 country code, passed to the API as `nationality`. */
  code: string;
  label: string;
}

interface LeagueStatsProps {
  league: League;
  /**
   * Nationality filters to offer above the lists. Only pass these for leagues
   * whose stats API supports the `nationality` query param (currently NHL,
   * where nationality is joined in from the club rosters).
   */
  nationalityFilters?: NationalityFilter[];
}

/** STATISTIK page: league-wide top scorers and goalies. */
export function LeagueStats({ league, nationalityFilters }: LeagueStatsProps) {
  const season = useSeason();
  const [nationality, setNationality] = useState<string | null>(null);
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
        const query = nationality
          ? `?nationality=${encodeURIComponent(nationality)}`
          : '';
        const [pRes, gRes] = await Promise.all([
          fetch(withSeason(`/api/${league}-players${query}`, season)),
          fetch(withSeason(`/api/${league}-goalies${query}`, season)),
        ]);
        if (!pRes.ok) throw new Error('players');
        const players: PlayerStatsData = await pRes.json();
        const topPlayers = [...players.stats]
          .sort((a, b) => b.TP - a.TP)
          .slice(0, 12);
        let topGoalies: GoalieStats[] = [];
        if (gRes.ok) {
          const goalieData: GoalieStatsData = await gRes.json();
          topGoalies = [...eligibleGoalies(goalieData.stats, nationality)]
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
  }, [league, season, nationality]);

  const activeLabel = nationalityFilters?.find(
    (f) => f.code === nationality,
  )?.label;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
        {leagueMeta[league].name} · Statistik
        {activeLabel ? ` · ${activeLabel}` : ''}
      </h1>

      {nationalityFilters && nationalityFilters.length > 0 && (
        <div className="mb-6 flex justify-center">
          <fieldset className="inline-flex rounded-lg border border-line bg-surface p-1">
            <legend className="sr-only">Filtrera på nationalitet</legend>
            <FilterButton
              label="Alla"
              active={nationality === null}
              onClick={() => setNationality(null)}
            />
            {nationalityFilters.map((filter) => (
              <FilterButton
                key={filter.code}
                label={filter.label}
                active={nationality === filter.code}
                onClick={() => setNationality(filter.code)}
              />
            ))}
          </fieldset>
        </div>
      )}

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
            {scorers.length === 0 ? (
              <p className="rounded-lg border border-line bg-surface px-4 py-6 text-center text-sm text-dim">
                Inga spelare att visa.
              </p>
            ) : (
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
            )}
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

/**
 * Goalies worth ranking by save percentage.
 *
 * The unfiltered feed is already a top-N slice of regulars, so it passes
 * through untouched. A nationality filter is served from the *full* league
 * leaderboard instead, where a backup with a single save would otherwise top a
 * save-percentage sort — so those sets keep only goalies who have played at
 * least a third of the busiest goalie's games.
 */
function eligibleGoalies(
  goalies: GoalieStats[],
  nationality: string | null,
): GoalieStats[] {
  if (!nationality || goalies.length === 0) return goalies;

  const maxGames = Math.max(...goalies.map((g) => g.GP));
  const minGames = Math.max(1, Math.ceil(maxGames / 3));
  return goalies.filter((g) => g.GP >= minGames);
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`display rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-[0.06em] transition-colors ${
        active ? 'bg-accent text-white' : 'text-mute hover:text-soft'
      }`}
    >
      {label}
    </button>
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
