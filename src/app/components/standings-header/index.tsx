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

export function StandingsHeader({ league, logoUrl, backgroundColor = 'rgba(24,29,38,1)', backPath }: StandingsHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLeagues = LEAGUES.filter(l => l.id !== league);
  
  // Use darker backgrounds for SHL/SDHL (light page background), lighter for CHL (dark page background)
  const isLightPage = league === 'shl' || league === 'sdhl';
  const circleClasses = isLightPage 
    ? "w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-800/80 hover:bg-gray-800 transition-all hover:scale-105 flex items-center justify-center overflow-hidden"
    : "w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center overflow-hidden";

  return (
    <div className="relative mb-8">
      {/* Header with circles */}
      <div className="max-w-6xl mx-auto flex items-center justify-between py-6 px-4 rounded-lg relative" style={{ backgroundColor }}>
        {/* League Logo (Circle) - Left */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={circleClasses}
            aria-label="Toggle league menu"
          >
            <Image
              src={logoUrl}
              alt={`${league.toUpperCase()} Logo`}
              width={80}
              height={80}
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
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
              <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
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

        {/* Back Arrow Icon - Right */}
        <Link 
          href={backPath}
          className={circleClasses + " group"}
          title="Tillbaka"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={isLightPage ? "h-8 w-8 text-gray-100 group-hover:text-white transition-colors" : "h-8 w-8 text-gray-300 group-hover:text-white transition-colors"}
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

