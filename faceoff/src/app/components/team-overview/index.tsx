'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useMemo } from 'react';
import { CountryFlag } from '@/app/components/country-flag';
import { CompactStandings } from '@/app/components/standings/compact-standings';
import { TeamForm } from '@/app/components/team-form';
import { TeamGames } from '@/app/components/team-games';
import { TopGoalie } from '@/app/components/top-goalie';
import { TopPlayer } from '@/app/components/top-player';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import type { TeamFormEntry } from '@/app/utils/teamForm';
import { buildTeamFormIndex } from '@/app/utils/teamForm';
import { previousGamesFor, upcomingGamesFor } from '@/app/utils/teamGames';
import { type RGB, rgba, useDominantColor } from '@/app/utils/useDominantColor';

/** How many games each of the team's lists holds. */
const GAMES_PER_LIST = 5;

/** Rows in the standings excerpt around the team. */
const STANDINGS_ROWS = 5;

// Neutral slate used until a logo color resolves, or when a logo has none.
const DEFAULT_ACCENT: RGB = { r: 82, g: 98, b: 128 };

interface TeamOverviewProps {
  team: TeamInfo;
  /** Games to read the team's schedule from; other teams' games are ignored. */
  games: GameInfo[];
  standings: StandingsData | null;
  league: League;
}

/**
 * A team on its own: form, top scorer and goalie, its place in the table and
 * its last and next games. Opponents only appear as rows in the lists.
 */
export const TeamOverview: React.FC<TeamOverviewProps> = ({
  team,
  games,
  standings,
  league,
}) => {
  const form = useMemo(
    () => buildTeamFormIndex(games).formFor(team.code, GAMES_PER_LIST),
    [games, team.code],
  );

  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4">
        <TeamHero team={team} form={form} />

        <div className="max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopPlayer league={league} teamCode={team.code} />
          <TopGoalie league={league} teamCode={team.code} />
        </div>

        {standings && (
          <div className="max-w-6xl mx-auto mb-8">
            <CompactStandings
              standings={standings}
              league={league}
              teamCode={team.code}
              rows={STANDINGS_ROWS}
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <TeamGames
            games={previousGamesFor(games, team.code, GAMES_PER_LIST)}
            currentTeamCode={team.code}
            league={league}
            kind="previous"
            title="Senast spelade"
          />
          <TeamGames
            games={upcomingGamesFor(games, team.code, GAMES_PER_LIST)}
            currentTeamCode={team.code}
            league={league}
            kind="upcoming"
            title="Kommande matcher"
          />
        </div>
      </div>
    </main>
  );
};

/**
 * Title card: the logo large with the name under it, on the same logo-coloured
 * fade as the matchup page's next-game card — here from the top, one team.
 */
function TeamHero({ team, form }: { team: TeamInfo; form: TeamFormEntry[] }) {
  const accent = useDominantColor(team.logo) ?? DEFAULT_ACCENT;

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/5"
        style={{
          background: [
            `radial-gradient(90% 120% at 50% 0%, ${rgba(accent, 0.5)} 0%, ${rgba(accent, 0.12)} 35%, transparent 65%)`,
            'linear-gradient(180deg, #0d1119, #090c12)',
          ].join(', '),
        }}
      >
        <div className="flex flex-col items-center gap-4 px-4 py-8 md:py-10">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full md:h-40 md:w-40"
            style={{
              backgroundColor: rgba(accent, 0.14),
              border: `1px solid ${rgba(accent, 0.3)}`,
              boxShadow: `0 0 55px ${rgba(accent, 0.35)}`,
            }}
          >
            {team.logo ? (
              <Image
                src={team.logo}
                alt=""
                aria-hidden="true"
                width={128}
                height={128}
                className="h-24 w-24 object-contain md:h-28 md:w-28"
                unoptimized
              />
            ) : (
              <span className="text-5xl text-mute">🏒</span>
            )}
          </div>
          <h1 className="display max-w-full break-words text-center text-3xl font-bold uppercase leading-tight tracking-[0.04em] text-ink md:text-5xl">
            {team.full}
          </h1>
          {team.country && (
            <CountryFlag
              country={team.country}
              className="h-6 w-[34px] md:h-7 md:w-[40px]"
            />
          )}
          {form.length > 0 && <TeamForm entries={form} size="md" />}
        </div>
      </div>
    </div>
  );
}

/** Placeholder while a team or matchup page loads its data. */
export function TeamPageLoading() {
  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-3 rounded mb-8 w-1/3 mx-auto"></div>
          <div className="h-64 bg-surface rounded mb-4"></div>
          <div className="h-4 bg-surface-3 rounded"></div>
        </div>
      </div>
    </main>
  );
}

/** Error state for a team or matchup page, with a way back to the league. */
export function TeamPageError({
  message,
  backHref,
  leagueName,
}: {
  message: string;
  backHref: string;
  leagueName: string;
}) {
  return (
    <main className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <div className="text-loss text-6xl mb-4">⚠️</div>
          <h1 className="display text-3xl font-bold uppercase tracking-[0.02em] text-ink mb-6">
            {message}
          </h1>
          <Link
            href={backHref}
            className="display inline-block rounded-lg bg-accent px-6 py-3 font-bold uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-90"
          >
            Tillbaka till {leagueName}
          </Link>
        </div>
      </div>
    </main>
  );
}
