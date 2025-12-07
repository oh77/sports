import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <h1 className="sr-only">Gameday – välj liga</h1>
      <div className="text-center">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link href="/shl" className="inline-block">
            <div
              className="w-48 h-48 md:w-80 md:h-80 p-4 md:p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: 'rgba(24,29,38,1)' }}
            >
              <Image
                src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
                alt="SHL Logo"
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <Link href="/sdhl" className="inline-block">
            <div
              className="w-48 h-48 md:w-80 md:h-80 p-4 md:p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: 'rgba(50,0,208,1)' }}
            >
              <Image
                src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
                alt="SDHL Logo"
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <Link href="/chl" className="inline-block">
            <div
              className="w-48 h-48 md:w-80 md:h-80 p-4 md:p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: '#20001c' }}
            >
              <Image
                src="https://www.chl.hockey/static/img/logo.png"
                alt="CHL Logo"
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
