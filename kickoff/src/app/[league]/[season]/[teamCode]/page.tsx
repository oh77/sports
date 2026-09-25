import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FormMarkers } from '@/app/components/form-markers';
import { MatchList } from '@/app/components/match-list';
import { MatchupTable, matchupRows } from '@/app/components/matchup-table';
import { TeamBadge } from '@/app/components/team-badge';
import { isLeague } from '@/app/config/leagues';
import {
  getMatches,
  getStandings,
  getTeamLeaders,
  getTeams,
} from '@/app/services/leagueData';
import type { PlayerStats } from '@/app/types/domain/player-stats';
import type { TeamCountry, TeamInfo } from '@/app/types/domain/team';
import { outcomeFor } from '@/app/utils/form';
import { teamCodeMatches } from '@/app/utils/leaguePaths';

/** Positions shown above and below the team in the table excerpt. */
const TABLE_RADIUS = 2;

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

  const team = teams.find((t) => teamCodeMatches(t.code, teamCode));
  if (!team) notFound();

  const teamMatches = matches.filter(
    (m) =>
      m.homeTeamInfo.teamInfo.code === team.code ||
      m.awayTeamInfo.teamInfo.code === team.code,
  );

  // The next match leads the upcoming list rather than sitting in a hero of
  // its own; an ongoing one leads it until it ends.
  const upcoming = teamMatches
    .filter((m) => m.state !== 'finished')
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
    .slice(0, 5);
  const previous = teamMatches
    .filter((m) => m.state === 'finished')
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
    .slice(0, 5);
  const form = previous.map((m) => outcomeFor(team.code, m)).reverse();

  // Where the team sits in the table, with its neighbours for context.
  // Both are optional context: a failure hides the excerpt / top scorer.
  const [standings, leaders] = await Promise.all([
    getStandings(league, season).catch((error) => {
      console.error(`Failed to fetch standings for ${league}:`, error);
      return undefined;
    }),
    getTeamLeaders(league, season, [team]).catch((error) => {
      console.error(`Failed to fetch team leaders for ${league}:`, error);
      return undefined;
    }),
  ]);
  const tableRows = matchupRows(
    standings?.stats ?? [],
    [team.code],
    TABLE_RADIUS,
  );

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
        <TeamHero team={team} topScorer={leaders?.get(team.code)?.topScorer} />

        {tableRows.length > 0 && (
          <section aria-label="Läget i tabellen">
            <MatchupTable
              rows={tableRows}
              highlight={[team.code]}
              highlightNote="det här laget"
              league={league}
              season={season}
              caption={`Tabellutdrag kring ${team.full}`}
            />
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Senaste matcherna
            </h2>
            <MatchList
              matches={previous}
              perspective={team.code}
              league={league}
              season={season}
            />
          </section>
          <section>
            <h2 className="display mb-3 text-lg font-bold uppercase tracking-[0.08em] text-ink">
              Kommande matcher
            </h2>
            <MatchList
              matches={upcoming}
              perspective={team.code}
              league={league}
              season={season}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

/**
 * The page's team on its own: logo, name and country centered in a card, with
 * the team's top scorer underneath when the leaderboard has one.
 */
function TeamHero({
  team,
  topScorer,
}: {
  team: TeamInfo;
  topScorer?: PlayerStats;
}) {
  return (
    <section
      aria-label="Lag"
      className="flex flex-col items-center gap-4 rounded-xl border border-line bg-surface px-4 py-16 text-center sm:px-6 sm:py-20"
    >
      <TeamBadge team={team} size="lg" />
      <span className="display text-xl font-bold uppercase tracking-[0.08em] text-ink">
        {team.full}
      </span>
      {team.country && <CountryLabel country={team.country} />}
      {topScorer && (
        <p className="flex items-baseline gap-2 text-sm text-soft">
          <span className="display text-[10px] font-bold uppercase tracking-[0.08em] text-dim">
            Toppskytt
          </span>
          <span>
            {topScorer.info.fullName} ({topScorer.G})
          </span>
        </p>
      )}
    </section>
  );
}

/**
 * Flag + country name. The name is the text alternative, so the flag is
 * decorative. UEFA serves these as 70x70 PNGs — small enough that the
 * optimizer would cost more than it saves at this size.
 */
function CountryLabel({ country }: { country: TeamCountry }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-dim">
      <Image
        src={country.flag}
        alt=""
        aria-hidden="true"
        width={16}
        height={16}
        className="shrink-0 object-contain"
        style={{ width: 16, height: 'auto' }}
        unoptimized
      />
      {country.name}
    </span>
  );
}
