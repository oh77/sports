'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CountryFlag } from '@/app/components/country-flag';
import { NHL_TEAMS } from '@/app/config/nhlTeams';
import type { RosterData, RosterPlayer } from '@/app/types/domain/roster';
import type { TeamInfo } from '@/app/types/domain/team';
import { withSeason } from '@/app/utils/leaguePaths';
import { useSeason } from '@/app/utils/useSeason';

/** Roster sections, in the order the NHL groups them. */
const GROUPS: { title: string; positions: string[] }[] = [
  { title: 'Forwards', positions: ['L', 'C', 'R'] },
  { title: 'Backar', positions: ['D'] },
  { title: 'Målvakter', positions: ['G'] },
];

/** Position codes as they read on a roster sheet. */
const POSITION_LABEL: Record<string, string> = {
  L: 'LW',
  C: 'C',
  R: 'RW',
  D: 'D',
  G: 'G',
};

/** LAG page: pick a club, see its full roster. */
export function NhlRoster() {
  const season = useSeason();
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setPlayers([]);
        const response = await fetch(
          withSeason(
            `/api/nhl-rosters?teamCode=${encodeURIComponent(team.code)}`,
            season,
          ),
        );
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data: RosterData = await response.json();
        if (active) setPlayers(data.players ?? []);
      } catch (err) {
        console.error('Failed to load NHL roster:', err);
        if (active) setError('Kunde inte ladda truppen');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [team, season]);

  const swedes = players.filter((p) => p.nationality === 'SE');

  return (
    <main className="relative py-6 md:py-8">
      <div className="container relative z-10 mx-auto px-4">
        <h1 className="display mb-6 text-3xl font-bold uppercase tracking-[0.02em] text-ink">
          NHL · Lag
        </h1>

        <fieldset className="mb-8">
          <legend className="display mb-3 text-sm font-bold uppercase tracking-[0.08em] text-mute">
            Välj lag
          </legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {NHL_TEAMS.map((club) => {
              const selected = club.code === team?.code;
              return (
                <button
                  key={club.code}
                  type="button"
                  onClick={() => setTeam(club)}
                  aria-pressed={selected}
                  title={club.full}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 transition-colors ${
                    selected
                      ? 'border-accent bg-surface-3'
                      : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <Image
                    src={club.logo}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    unoptimized
                  />
                  <span
                    className={`display text-[11px] font-bold uppercase tracking-[0.06em] ${
                      selected ? 'text-ink' : 'text-mute'
                    }`}
                  >
                    {club.code}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {!team && (
          <p className="rounded-lg border border-line bg-surface px-6 py-12 text-center text-dim">
            Välj ett lag för att se truppen.
          </p>
        )}

        {team && (
          <section aria-live="polite">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src={team.logo}
                alt=""
                width={64}
                height={64}
                className="h-14 w-14 object-contain md:h-16 md:w-16"
                unoptimized
              />
              <div>
                <h2 className="display text-xl font-bold uppercase tracking-[0.04em] text-ink">
                  {team.full}
                </h2>
                {!loading && !error && players.length > 0 && (
                  <p className="flex items-center gap-2 text-xs text-dim">
                    <span>{players.length} spelare</span>
                    {swedes.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <CountryFlag
                          country="SE"
                          label={`Svenskar i truppen: ${swedes
                            .map((p) => p.fullName)
                            .join(', ')}`}
                          className="h-3 w-[19px]"
                        />
                        <span>
                          {swedes.length}{' '}
                          {swedes.length === 1 ? 'svensk' : 'svenskar'}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {loading && (
              <div className="h-96 animate-pulse rounded-lg bg-surface" />
            )}

            {!loading && error && <p className="text-dim">{error}</p>}

            {!loading && !error && players.length === 0 && (
              <p className="rounded-lg border border-line bg-surface px-6 py-12 text-center text-dim">
                Ingen trupp tillgänglig för den här säsongen.
              </p>
            )}

            {!loading && !error && players.length > 0 && (
              <div className="space-y-6">
                {GROUPS.map((group) => (
                  <RosterGroup
                    key={group.title}
                    title={group.title}
                    players={sortForRoster(
                      players.filter((p) =>
                        group.positions.includes(p.position),
                      ),
                    )}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

/** Jersey number ascending, with unnumbered players last. */
function sortForRoster(players: RosterPlayer[]): RosterPlayer[] {
  return [...players].sort((a, b) => {
    if (a.number === null) return b.number === null ? 0 : 1;
    if (b.number === null) return -1;
    return a.number - b.number;
  });
}

function RosterGroup({
  title,
  players,
}: {
  title: string;
  players: RosterPlayer[];
}) {
  if (players.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="display border-b border-line bg-surface-2 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-ink">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">{title} i truppen</caption>
          <thead className="border-b border-line bg-surface-2">
            <tr>
              {[
                { label: '#', align: 'text-right' },
                { label: 'Spelare', align: 'text-left' },
                { label: 'Pos', align: 'text-center' },
                { label: 'Fattning', align: 'text-center' },
                { label: 'Längd', align: 'text-center' },
                { label: 'Vikt', align: 'text-center' },
                { label: 'Född', align: 'text-center' },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`display px-4 py-3 text-xs uppercase tracking-[0.06em] text-mute ${col.align}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {players.map((player) => (
              <tr
                key={player.uuid}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="display num whitespace-nowrap px-4 py-3 text-right text-sm text-mute">
                  {player.number ?? '–'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-3">
                      {player.headshot ? (
                        <Image
                          src={player.headshot}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 object-cover"
                        />
                      ) : (
                        <span className="display text-[11px] font-bold text-mute">
                          {initials(player)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">
                        {player.fullName}
                      </span>
                      {player.nationality && (
                        <CountryFlag
                          country={player.nationality}
                          label={
                            player.birthCity
                              ? `${player.birthCity}, ${player.nationalityCode}`
                              : player.nationalityCode
                          }
                          className="h-3.5 w-[22px] shrink-0"
                        />
                      )}
                    </span>
                  </div>
                </td>
                <td className="display whitespace-nowrap px-4 py-3 text-center text-sm text-soft">
                  {POSITION_LABEL[player.position] ?? player.position}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-soft">
                  {player.shoots ?? '–'}
                </td>
                <td className="num whitespace-nowrap px-4 py-3 text-center text-sm text-soft">
                  {player.heightCm > 0 ? `${player.heightCm} cm` : '–'}
                </td>
                <td className="num whitespace-nowrap px-4 py-3 text-center text-sm text-soft">
                  {player.weightKg > 0 ? `${player.weightKg} kg` : '–'}
                </td>
                <td className="num whitespace-nowrap px-4 py-3 text-center text-sm text-dim">
                  {player.birthDate || '–'}
                  {ageOf(player.birthDate) !== null && (
                    <span className="ml-1 text-xs text-mute">
                      ({ageOf(player.birthDate)})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function initials(player: RosterPlayer): string {
  return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
}

/** Age in whole years, or null when the birth date is missing/unparseable. */
function ageOf(birthDate: string): number | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) {
    age -= 1;
  }
  return age;
}
