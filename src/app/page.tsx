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
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="sr-only">Gameday – välj liga</h1>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {LEAGUES.map((league) => (
            <Link key={league.href} href={league.href} className="inline-block">
              <div
                className="flex h-36 w-36 items-center justify-center rounded-lg p-4 transition-opacity hover:opacity-80 md:h-44 md:w-44"
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

        <section className="mx-auto mt-10 max-w-2xl">
          <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-500">
            Kommande matcher
          </h2>
          <UpcomingAllLeagues limit={10} />
        </section>
      </div>
    </main>
  );
}
