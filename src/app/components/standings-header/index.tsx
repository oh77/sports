'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StandingsHeaderProps {
  league: 'shl' | 'sdhl' | 'chl';
  leagueName: string;
  logoUrl: string;
  backgroundColor?: string;
  backPath: string;
}

const LEAGUES = [
  { id: 'shl', name: 'SHL', path: '/shl' },
  { id: 'sdhl', name: 'SDHL', path: '/sdhl' },
  { id: 'chl', name: 'CHL', path: '/chl' },
];

export function StandingsHeader({ league, leagueName, logoUrl, backgroundColor = 'rgba(24,29,38,1)', backPath }: StandingsHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLeagues = LEAGUES.filter(l => l.id !== league);

  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 py-6 rounded-lg relative" style={{ backgroundColor }}>
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-16 h-16 md:w-20 md:h-20 hover:scale-105 transition-transform cursor-pointer"
            aria-label="Toggle league menu"
          >
            <Image
              src={logoUrl}
              alt={`${league.toUpperCase()} Logo`}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          </button>
          
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMenuOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                    Byt liga
                  </div>
                  {otherLeagues.map((l) => (
                    <Link
                      key={l.id}
                      href={l.path}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 mt-2"></div>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Hem
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider">
            LIGATABELL
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mt-2">
            {leagueName}
          </p>
        </div>

        {/* Back Arrow Icon */}
        <Link 
          href={backPath}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors group"
          title="Tillbaka"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

