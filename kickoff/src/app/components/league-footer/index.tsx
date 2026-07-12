import Link from 'next/link';
import { TeamBadge } from '@/app/components/team-badge';
import { getTeams } from '@/app/services/leagueData';
import { leagueMeta } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import { teamPath } from '@/app/utils/leaguePaths';

type Props = {
  league: League;
  season?: string;
};

export default async function LeagueFooter({ league, season }: Props) {
  let teams: TeamInfo[] = [];
  try {
    teams = [...(await getTeams(league, season))].sort((a, b) =>
      a.long.localeCompare(b.long, 'sv'),
    );
  } catch (error) {
    console.error(`Failed to fetch footer teams for ${league}:`, error);
  }

  return (
    <footer className="mt-12 border-t border-line py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-sm text-mute md:px-6">
        {teams.length > 0 && (
          <nav aria-label={`Lag i ${leagueMeta[league].name}`}>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              {teams.map((team) => (
                <li key={team.code}>
                  <Link
                    href={teamPath(league, season, team.code)}
                    title={team.long}
                    className="flex opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                  >
                    <TeamBadge team={team} size="md" />
                    <span className="sr-only">{team.long}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex flex-col items-center gap-2">
          <p className="display font-bold uppercase tracking-[0.1em]">
            {leagueMeta[league].name}
          </p>
          <Link href="/" className="text-soft transition-colors hover:text-ink">
            Till startsidan
          </Link>
        </div>
      </div>
    </footer>
  );
}
