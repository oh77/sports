import { notFound } from 'next/navigation';
import { FormMarkers } from '@/app/components/form-markers';
import { MatchList } from '@/app/components/match-list';
import { TeamBadge } from '@/app/components/team-badge';
import { isLeague } from '@/app/config/leagues';
import { getMatches, getTeams } from '@/app/services/leagueData';
import type { MatchInfo } from '@/app/types/domain/match';
import type { MatchOutcome } from '@/app/types/domain/standings';
import {
  formatLongDateFromString,
  formatTimeFromString,
} from '@/app/utils/dateUtils';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ league: string; season: string; teamCode: string }>;
}) {
  const { league, season, teamCode } = await params;
  if (!isLeague(league)) notFound();

  const [teams, { matches }] = await Promise.all([
    getTeams(league, season),
    getMatches(league, season),
  ]);

  const team = teams.find((t) => t.code === teamCode);
  if (!team) notFound();

  const teamMatches = matches.filter(
    (m) =>
      m.homeTeamInfo.teamInfo.code === team.code ||
      m.awayTeamInfo.teamInfo.code === team.code,
  );

  const nextMatch = teamMatches
    .filter((m) => m.state === 'not-started')
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))[0];
  const previous = teamMatches
    .filter((m) => m.state === 'finished')
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
    .slice(0, 5);
  const form = previous.map((m) => outcomeFor(team.code, m)).reverse();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <TeamBadge team={team} />
        <h1 className="display text-2xl font-bold uppercase tracking-[0.08em] text-ink">
          {team.full}
        </h1>
        {form.length > 0 && <FormMarkers form={form} />}
      </div>

      <div className="flex flex-col gap-8">
        {nextMatch && (
          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Nästa match
            </h2>
            <p className="text-sm text-soft">
              {formatLongDateFromString(nextMatch.startDateTime)} kl.{' '}
              {formatTimeFromString(nextMatch.startDateTime)}
            </p>
            <p className="mt-1 font-medium text-ink">
              {nextMatch.homeTeamInfo.teamInfo.long} –{' '}
              {nextMatch.awayTeamInfo.teamInfo.long}
            </p>
            <p className="mt-1 text-sm text-dim">{nextMatch.venueInfo.name}</p>
          </section>
        )}

        <section>
          <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
            Senaste matcherna
          </h2>
          <MatchList matches={previous} />
        </section>
      </div>
    </main>
  );
}

function outcomeFor(teamCode: string, match: MatchInfo): MatchOutcome {
  const isHome = match.homeTeamInfo.teamInfo.code === teamCode;
  const own = isHome ? match.homeTeamInfo.score : match.awayTeamInfo.score;
  const other = isHome ? match.awayTeamInfo.score : match.homeTeamInfo.score;
  if (own > other) return 'W';
  if (own < other) return 'L';
  return 'D';
}
