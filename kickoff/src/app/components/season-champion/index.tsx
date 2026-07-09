import Link from 'next/link';
import { TeamBadge } from '@/app/components/team-badge';
import { seasonLabel } from '@/app/config/leagues';
import type { League } from '@/app/types/domain/league';
import type { TeamInfo } from '@/app/types/domain/team';
import { teamPath } from '@/app/utils/leaguePaths';

type Props = {
  team: TeamInfo;
  league: League;
  season: string;
};

/**
 * Champion card shown on the league overview once a season is fully played,
 * in place of the upcoming-matches section.
 */
export function SeasonChampion({ team, league, season }: Props) {
  return (
    <Link
      href={teamPath(league, season, team.code)}
      className="flex flex-col items-center gap-3 rounded-xl border border-accent/40 bg-surface px-6 py-8 text-center transition-colors hover:border-accent"
    >
      <span className="display text-[13px] font-bold uppercase tracking-[0.14em] text-accent">
        Mästare {seasonLabel(season)}
      </span>
      <TeamBadge team={team} size="lg" />
      <span className="display text-2xl font-bold uppercase tracking-[0.06em] text-ink">
        {team.full}
      </span>
    </Link>
  );
}
