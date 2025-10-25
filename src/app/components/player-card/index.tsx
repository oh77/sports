'use client';

import Image from 'next/image';
import React from 'react';

interface PlayerCardProps {
  imageUrl: string;
  playerName: string;
  playerNumber: number;
  primaryValue: string | number;
  secondaryValue: string | number;
  rank: number;
  nationality: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  imageUrl,
  playerName,
  playerNumber,
  primaryValue,
  secondaryValue,
  rank,
  nationality,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Player Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={imageUrl}
          alt={playerName}
          fill
          className="object-cover"
        />
        {/* Player Number */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
          {playerNumber}
        </div>
        {/* Rank Badge */}
        <div className="absolute top-4 left-4 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
          #{rank}
        </div>
      </div>

      {/* Player Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{playerName}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {nationality}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{primaryValue}</div>
            <div className="text-xs text-gray-500 uppercase">Primary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{secondaryValue}</div>
            <div className="text-xs text-gray-500 uppercase">Secondary</div>
          </div>
        </div>
      </div>
    </div>
  );
};