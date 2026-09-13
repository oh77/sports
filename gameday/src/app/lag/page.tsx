import type { Metadata } from 'next';
import Image from 'next/image';
import { CopyCode } from '@/app/components/copy-code';
import { LeagueBadge } from '@/app/components/league-badge';
import { SiteHeader } from '@/app/components/site-header';
import { LEAGUES } from '@/app/config/leagues';
import { getTeamsByLeague } from '@/app/services/teamsService';
import type { League } from '@/app/types/domain/league';
import type { Team } from '@/app/types/domain/team';
import { isFavoriteTeam } from '@/app/utils/favorites';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Lag · Gameday',
};

const LEAGUE_ORDER = Object.keys(LEAGUES) as League[];

export default async function TeamsPage() {
  const teamsByLeague = await getTeamsByLeague();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader current="lag" />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        <h1 className="display text-3xl font-bold uppercase tracking-[0.08em]">
          Lag
        </h1>
        <p className="mt-1 text-sm text-dim">
          Använd koden i{' '}
          <code className="text-soft">src/app/config/favorites.ts</code>, t.ex.{' '}
          <code className="text-soft">
            {"{ name: 'Malmö FF', codes: { allsvenskan: 'mff' } }"}
          </code>
          . Nyckeln är ligans id, som visas vid varje liga.
        </p>

        <nav aria-label="Ligor" className="mt-5">
          <ul className="flex flex-wrap gap-2 text-sm">
            {LEAGUE_ORDER.map((league) => (
              <li key={league}>
                <a
                  href={`#liga-${league}`}
                  className="inline-block rounded-md bg-surface-3 px-2.5 py-1 text-soft transition-colors hover:text-ink"
                >
                  {LEAGUES[league].name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {LEAGUE_ORDER.map((league) => (
          <LeagueTeams
            key={league}
            league={league}
            teams={teamsByLeague[league]}
          />
        ))}
      </main>
    </div>
  );
}

function LeagueTeams({ league, teams }: { league: League; teams?: Team[] }) {
  const headingId = `liga-${league}-rubrik`;
  return (
    <section
      id={`liga-${league}`}
      aria-labelledby={headingId}
      className="mt-10 scroll-mt-4"
    >
      <div className="flex items-center gap-2.5">
        <h2
          id={headingId}
          className="display flex min-w-0 items-center gap-2.5 text-xl font-bold uppercase tracking-[0.08em]"
        >
          <LeagueBadge league={league} />
          {LEAGUES[league].name}
        </h2>
        <span className="ml-auto flex">
          <CopyCode code={league} icon />
        </span>
      </div>

      {!teams ? (
        <p className="mt-3 text-sm text-dim">Kunde inte hämta lag just nu.</p>
      ) : teams.length === 0 ? (
        <p className="mt-3 text-sm text-dim">Inga lag publicerade ännu.</p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const favorite = isFavoriteTeam(league, team.code);
            return (
              <li
                key={team.code}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2"
              >
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt=""
                    aria-hidden="true"
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 object-contain"
                  />
                ) : (
                  <span aria-hidden="true" className="h-7 w-7 shrink-0" />
                )}
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    favorite ? 'font-semibold text-ink' : 'text-soft'
                  }`}
                >
                  {team.name}
                  {favorite && (
                    <>
                      <span aria-hidden="true" className="ml-1.5 text-accent">
                        ★
                      </span>
                      <span className="sr-only"> (favoritlag)</span>
                    </>
                  )}
                </span>
                <CopyCode code={team.code} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
