import Image from 'next/image';
import Link from 'next/link';
import { UpcomingAllLeagues } from './components/upcoming-all-leagues';

const LEAGUES = [
  {
    href: '/shl',
    bg: 'rgba(24,29,38,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg',
    name: 'SHL',
  },
  {
    href: '/sdhl',
    bg: 'rgba(50,0,208,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg',
    name: 'SDHL',
  },
  {
    href: '/ha',
    bg: 'rgba(30,41,59,1)',
    logo: 'https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg',
    name: 'Hockeyallsvenskan',
  },
  {
    href: '/chl',
    bg: '#20001c',
    logo: 'https://www.chl.hockey/static/img/logo.png',
    name: 'CHL',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col items-center gap-2">
          <h1 className="display text-4xl font-bold uppercase tracking-[0.08em] text-ink md:text-5xl">
            Gameday
          </h1>
          <p className="text-sm text-dim">Välj liga</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {LEAGUES.map((league) => (
            <Link key={league.href} href={league.href} className="inline-block">
              <div
                className="flex h-36 w-36 items-center justify-center rounded-xl border border-line p-4 transition-all hover:scale-[1.03] hover:border-line-strong md:h-44 md:w-44"
                style={{ backgroundColor: league.bg }}
              >
                <Image
                  src={league.logo}
                  alt={`${league.name} Logo`}
                  width={300}
                  height={300}
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
          ))}
        </div>

        <section className="mx-auto mt-12 max-w-2xl">
          <h2 className="display mb-3 text-center text-sm font-bold uppercase tracking-[0.1em] text-mute">
            Kommande matcher
          </h2>
          <UpcomingAllLeagues limit={10} />
        </section>
      </div>
    </main>
  );
}
