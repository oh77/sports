import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex space-x-8">
          <Link href="/shl" className="inline-block">
            <div 
              className="w-80 h-80 p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: 'rgba(24,29,38,1)' }}
            >
              <Image 
                src="https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg"
                alt="SHL Logo"
                width={300}
                height={300}
              />
            </div>
          </Link>
          
          <Link href="/sdhl" className="inline-block">
            <div 
              className="w-80 h-80 p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: 'rgba(50,0,208,1)' }}
            >
              <Image 
                src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
                alt="SDHL Logo"
                width={300}
                height={300}
              />
            </div>
          </Link>

          <Link href="/chl" className="inline-block">
            <div 
              className="w-80 h-80 p-6 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: '#20001c' }}
            >
              <Image 
                src="https://www.chl.hockey/static/img/logo.png"
                alt="CHL Logo"
                width={300}
                height={300}
              />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
