'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getRankDisplay } from '@/app/components/standings/standingsUtils';
import type { StandingsData, TeamStats } from '@/app/types/domain/standings';
import { teamPath } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';

type ViewMode = 'division' | 'conference' | 'league';

/** Display order for divisions (Eastern first, then Western). */
const DIVISION_ORDER = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
/** Display order for conferences. */
const CONFERENCE_ORDER = ['Eastern', 'Western'];

const MODES: { id: ViewMode; label: string }[] = [
  { id: 'division', label: 'Division' },
  { id: 'conference', label: 'Conference' },
  { id: 'league', label: 'Liga' },
];

interface NhlStandingsProps {
  standings: StandingsData;
}

export function NhlStandings({ standings }: NhlStandingsProps) {
  const [mode, setMode] = useState<ViewMode>('division');
  const teams = standings.stats || [];

  const groups = buildGroups(teams, mode);

  return (
    <div className="max-w-6xl mx-auto">
      {/* View toggle */}
      <div className="mb-5 flex justify-center">
        <div className="inline-flex rounded-lg border border-line bg-surface p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`display rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-[0.06em] transition-colors ${
                mode === m.id
                  ? 'bg-accent text-white'
                  : 'text-mute hover:text-soft'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <StandingsGroup
            key={group.title}
            title={group.title}
            teams={group.teams}
            playoffCount={group.playoffCount}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-dim">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-1.5 rounded bg-win" />
          <span>Slutspelsplats</span>
        </div>
      </div>
    </div>
  );
}

type Group = { title: string; teams: TeamStats[]; playoffCount: number };

/** Group and order teams for the selected view. */
function buildGroups(teams: TeamStats[], mode: ViewMode): Group[] {
  const byRank = (a: TeamStats, b: TeamStats) =>
    (a.Rank ?? 999) - (b.Rank ?? 999);

  if (mode === 'league') {
    return [{ title: 'NHL', teams: [...teams].sort(byRank), playoffCount: 0 }];
  }

  const key = mode === 'division' ? 'division' : 'conference';
  const order = mode === 'division' ? DIVISION_ORDER : CONFERENCE_ORDER;
  // Top 3 per division / top 8 per conference make the playoffs.
  const playoffCount = mode === 'division' ? 3 : 8;

  const buckets = new Map<string, TeamStats[]>();
  for (const team of teams) {
    const name = team[key];
    if (!name) continue;
    const list = buckets.get(name) ?? [];
    list.push(team);
    buckets.set(name, list);
  }

  const names = [...buckets.keys()].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return names.map((name) => ({
    title: name,
    teams: (buckets.get(name) ?? []).sort(byRank),
    playoffCount,
  }));
}

function StandingsGroup({
  title,
  teams,
  playoffCount,
}: {
  title: string;
  teams: TeamStats[];
  playoffCount: number;
}) {
  const season = useSeason();

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="display border-b border-line bg-surface-2 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-ink">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-line bg-surface-2">
            <tr>
              {['#', 'Lag', 'M', 'V', 'F', 'ÖF', 'P', 'G', 'GA', 'GM'].map(
                (col, i) => (
                  <th
                    key={col}
                    className={`display px-4 py-3 text-xs uppercase tracking-[0.06em] text-mute ${
                      i < 2 ? 'text-left' : 'text-center'
                    }`}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {teams.map((team, index) => {
              const rank = index + 1;
              const diff = team.G - team.GA;
              const isPlayoff = playoffCount > 0 && rank <= playoffCount;

              return (
                <tr
                  key={team.info.code}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td
                    className={`display whitespace-nowrap px-4 py-4 text-sm text-ink ${
                      isPlayoff
                        ? 'border-l-2 border-win'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    {getRankDisplay(rank)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <Link
                      href={teamPath('nhl', season, team.info.code)}
                      className="flex items-center space-x-3 transition-opacity hover:opacity-80"
                    >
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-surface-3">
                        {team.info.logo ? (
                          <Image
                            src={team.info.logo}
                            alt={team.info.short}
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <span className="text-sm text-mute">🏒</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {team.info.short}
                        </div>
                        <div className="text-xs text-mute">
                          {team.info.full}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm text-soft">
                    {team.GP}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-soft">
                    {team.W}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm text-soft">
                    {team.L}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm text-soft">
                    {team.OTL ?? 0}
                  </td>
                  <td className="display num whitespace-nowrap px-4 py-4 text-center text-lg font-bold text-ink">
                    {team.Points}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-soft">
                    {team.G}
                  </td>
                  <td className="num whitespace-nowrap px-4 py-4 text-center text-sm text-soft">
                    {team.GA}
                  </td>
                  <td
                    className={`num whitespace-nowrap px-4 py-4 text-center text-sm font-medium ${
                      diff > 0
                        ? 'text-win'
                        : diff < 0
                          ? 'text-loss'
                          : 'text-dim'
                    }`}
                  >
                    {diff > 0 ? '+' : ''}
                    {diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
