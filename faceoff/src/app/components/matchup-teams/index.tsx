'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { TeamGames } from '@/app/components/team-games';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import { teamPath } from '@/app/utils/leaguePaths';
import {
  previousGamesFor,
  teamInfoFromGames,
  upcomingGamesFor,
} from '@/app/utils/teamGames';
import { useSeason } from '@/app/utils/useSeason';

/** How many games each team's lists hold on the matchup page. */
const GAMES_PER_LIST = 3;

interface MatchupTeamsProps {
  /** Every game to read both teams' schedules from. */
  games: GameInfo[];
  /** Shown first — the home side of the featured meeting. */
  homeTeamCode: string;
  awayTeamCode: string;
  league: League;
}

/**
 * The two teams of a matchup side by side, home team first: each team's last
 * played and next coming games.
 */
export const MatchupTeams: React.FC<MatchupTeamsProps> = ({
  games,
  homeTeamCode,
  awayTeamCode,
  league,
}) => (
  <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
    {[homeTeamCode, awayTeamCode].map((code) => (
      <TeamColumn key={code} code={code} games={games} league={league} />
    ))}
  </div>
);

function TeamColumn({
  code,
  games,
  league,
}: {
  code: string;
  games: GameInfo[];
  league: League;
}) {
  const team = teamInfoFromGames(games, code);
  if (!team) return null;

  return (
    <section aria-label={team.full} className="flex flex-col gap-4">
      <TeamHeading team={team} league={league} />
      <TeamGames
        games={previousGamesFor(games, code, GAMES_PER_LIST)}
        currentTeamCode={code}
        league={league}
        kind="previous"
        title="Senast spelade"
        headingLevel="h3"
      />
      <TeamGames
        games={upcomingGamesFor(games, code, GAMES_PER_LIST)}
        currentTeamCode={code}
        league={league}
        kind="upcoming"
        title="Kommande matcher"
        headingLevel="h3"
      />
    </section>
  );
}

/** Logo and name; the name links on to the team's own page. */
function TeamHeading({ team, league }: { team: TeamInfo; league: League }) {
  const season = useSeason();

  return (
    <div className="flex items-center gap-3 border-b border-line-soft pb-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3">
        {team.logo && (
          <Image
            src={team.logo}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
            unoptimized
          />
        )}
      </span>
      <h2 className="display text-lg font-bold uppercase tracking-[0.04em] text-ink">
        <Link
          href={teamPath(league, season, team.code)}
          className="transition-colors hover:text-accent"
        >
          {team.full}
        </Link>
      </h2>
    </div>
  );
}
