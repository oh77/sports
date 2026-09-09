'use client';

import type { ReactNode } from 'react';
import { Suspense, useEffect, useState } from 'react';
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
import type { TeamInfo } from '@/app/types/domain/team';
import { withSeason } from '@/app/utils/leaguePaths';
import { fetchLeagueTeams, indexTeamsByCode } from '@/app/utils/leagueTeams';
import { useSeason } from '@/app/utils/useSeason';
import { PlayerCard } from '../player-card';
import { Tabs } from '../tabs';
import { buildGoaliePairs, type GoaliePair } from './goaliePairs';

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

/**
 * STATISTIK page: league-wide top scorers and goalies.
 *
 * The tabs read their selection from the `tab` query param, so the page needs a
 * Suspense boundary around the client tree that calls `useSearchParams`.
 */
export function LeagueStats(props: LeagueStatsProps) {
  return (
    <Suspense fallback={<StatsFallback league={props.league} />}>
      <LeagueStatsContent {...props} />
    </Suspense>
  );
}

function LeagueStatsContent({ league, nationalityFilters }: LeagueStatsProps) {
  const season = useSeason();
  const [nationality, setNationality] = useState<string | null>(null);
  const [scorers, setScorers] = useState<PlayerStats[]>([]);
  const [goalies, setGoalies] = useState<GoalieStats[]>([]);
  const [pairs, setPairs] = useState<GoaliePair[]>([]);
  const [clubs, setClubs] = useState<Map<string, TeamInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [pairsLoading, setPairsLoading] = useState(true);
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
            .slice(0, 12);
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

  // Pairs are club-wide, so they ignore the nationality filter and need the
  // full leaderboard rather than the top slice the other lists are built from.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setPairsLoading(true);
        const res = await fetch(
          withSeason(`/api/${league}-goalies?full=1`, season),
        );
        if (!res.ok) throw new Error('goalies');
        const data: GoalieStatsData = await res.json();
        if (active) setPairs(buildGoaliePairs(data.stats));
      } catch (err) {
        console.error('Failed to load goalie pairs:', err);
        if (active) setPairs([]);
      } finally {
        if (active) setPairsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [league, season]);

  // Club logos and full names: the goalie feeds carry only a team code (and for
  // NHL, only the abbrev as its "name").
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const teams = await fetchLeagueTeams(league, season);
        if (active) setClubs(indexTeamsByCode(teams));
      } catch (err) {
        console.error('Failed to load club list:', err);
        if (active) setClubs(new Map());
      }
    })();
    return () => {
      active = false;
    };
  }, [league, season]);

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
        <StatsSkeleton />
      ) : (
        <Tabs
          tabs={[
            {
              id: 'skaters',
              label: 'Utespelare',
              content: (
                <Panel title="Poängliga" empty={scorers.length === 0}>
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
                </Panel>
              ),
            },
            {
              id: 'goalies',
              label: 'Målvakter',
              content: (
                <Panel title="Målvakter" empty={goalies.length === 0}>
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
                </Panel>
              ),
            },
            {
              id: 'pairs',
              label: 'Målvaktspar',
              content: pairsLoading ? (
                <StatsSkeleton />
              ) : (
                <Panel
                  title="Målvaktspar"
                  empty={pairs.length === 0}
                  emptyMessage="Inga målvaktspar att visa."
                >
                  {pairs.map((pair, index) => {
                    const club = clubs.get(pair.teamKey.toUpperCase());
                    const teamName = club?.full || pair.teamName;
                    // The pair *is* the subject here, so the card's player slot
                    // carries the club and its club line the two goalies.
                    return (
                      <PlayerCard
                        key={pair.teamKey}
                        playerName={teamName}
                        playerNumber={0}
                        logo={
                          club?.logo
                            ? { src: club.logo, alt: teamName }
                            : undefined
                        }
                        primaryValue={`${pair.savePercentage.toFixed(2)}%`}
                        secondaryValue={`${pair.goalsAgainstAverage.toFixed(2)} GAA`}
                        rank={index + 1}
                        nationality=""
                        club={pair.goalies
                          .map((g) => `${g.info.fullName} (${g.GP})`)
                          .join(' · ')}
                      />
                    );
                  })}
                </Panel>
              ),
            },
          ]}
        />
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

/**
 * One tab's list. The heading repeats the tab label for screen readers, which
 * otherwise get an unlabelled run of player cards.
 */
function Panel({
  title,
  empty,
  emptyMessage = 'Inga spelare att visa.',
  children,
}: {
  title: string;
  empty: boolean;
  emptyMessage?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="sr-only">{title}</h2>
      {empty ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-6 text-center text-sm text-dim">
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
          className="h-[52px] animate-pulse rounded-lg border border-line bg-surface"
        />
      ))}
    </div>
  );
}

function StatsFallback({ league }: { league: League }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
        {leagueMeta[league].name} · Statistik
      </h1>
      <StatsSkeleton />
    </div>
  );
}
