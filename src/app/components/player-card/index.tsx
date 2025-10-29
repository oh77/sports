'use client';

import React from 'react';

interface PlayerCardProps {
  imageUrl: string;
  playerName: string;
  playerNumber: number;
  primaryValue: string;
  secondaryValue: string;
  rank: number | null;
  nationality: string;
}

const getCountryFlag = (nationality: string): string => {
  const countryMap: Record<string, string> = {
    'FI': '🇫🇮', // Finland
    'SE': '🇸🇪', // Sweden
    'CA': '🇨🇦', // Canada
    'US': '🇺🇸', // United States
    'CZ': '🇨🇿', // Czech Republic
    'SK': '🇸🇰', // Slovakia
    'NO': '🇳🇴', // Norway
    'NOR': '🇳🇴', // Norway
    'DK': '🇩🇰', // Denmark
    'DE': '🇩🇪', // Germany
    'CH': '🇨🇭', // Switzerland
    'AT': '🇦🇹', // Austria
    'FR': '🇫🇷', // France
    'RU': '🇷🇺', // Russia
    'LV': '🇱🇻', // Latvia
    'EE': '🇪🇪', // Estonia
    'LT': '🇱🇹', // Lithuania
    'PL': '🇵🇱', // Poland
    'BE': '🇧🇪', // Belgium
    'NL': '🇳🇱', // Netherlands
    'GB': '🇬🇧', // Great Britain
    'IE': '🇮🇪', // Ireland
    'IT': '🇮🇹', // Italy
    'ES': '🇪🇸', // Spain
    'AU': '🇦🇺', // Australia
    'JP': '🇯🇵', // Japan
    'KR': '🇰🇷', // South Korea
    'CN': '🇨🇳', // China
  };

  // Try to match the nationality string (could be code like "FI" or full name)
  const code = nationality.toUpperCase().trim();
  return countryMap[code] || '';
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerNumber,
  primaryValue,
  secondaryValue,
  rank,
  nationality,
}) => {
  const flagEmoji = getCountryFlag(nationality);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left side: Number, Name */}
          <div className="flex items-center gap-3">
            {/* Player Number with Flag Background */}
            <div className="relative inline-flex items-center justify-center">
              {/* Flag emoji as background */}
              <span
                className="absolute text-8xl opacity-30 -rotate-[30deg] pointer-events-none"
                title={nationality}
                aria-hidden="true"
              >
                {flagEmoji}
              </span>
              {/* Player Number */}
              <span className="relative text-sm font-semibold text-gray-600 z-10">#{playerNumber}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{playerName}</h3>
          </div>

          {/* Right side: Primary, Secondary, Rank */}
          <div className="flex items-center gap-3">
            {/* Primary Value - Standout */}
            <span className="text-2xl font-bold text-blue-600">{primaryValue}</span>

            {/* Secondary Value with spacing inside brackets */}
            <span className="text-base font-semibold text-gray-500">[ {secondaryValue} ]</span>

            {/* Rank */}
            {rank && (
              <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                #{rank}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
