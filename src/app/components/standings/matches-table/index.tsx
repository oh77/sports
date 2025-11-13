'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import { formatShortDateFromString } from '@/app/utils/dateUtils';
import { calculateLargestWins, type LargestWin } from '../matchUtils';

interface MatchesTableProps {
  league: League;
  games: GameInfo[];
}

export function MatchesTable({ league: _league, games }: MatchesTableProps) {
  const [homeWins, setHomeWins] = useState<LargestWin[]>([]);
  const [awayWins, setAwayWins] = useState<LargestWin[]>([]);
  const [highestScoring, setHighestScoring] = useState<
    Array<LargestWin & { totalGoals: number }>
  >([]);
  const [lowestScoring, setLowestScoring] = useState<
    Array<LargestWin & { totalGoals: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (games.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const {
        homeWins: hWins,
        awayWins: aWins,
        highestScoring: hScoring,
        lowestScoring: lScoring,
      } = calculateLargestWins(games);
      setHomeWins(hWins);
      setAwayWins(aWins);
      setHighestScoring(hScoring);
      setLowestScoring(lScoring);
    } catch (error) {
      console.error('Error calculating largest wins:', error);
    } finally {
      setLoading(false);
    }
  }, [games]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (
    homeWins.length === 0 &&
    awayWins.length === 0 &&
    highestScoring.length === 0 &&
    lowestScoring.length === 0
  ) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center text-gray-500">
            Ingen matchdata tillgänglig
          </div>
        </div>
      </div>
    );
  }

  const renderMatchRow = (match: LargestWin, _isHomeWin: boolean) => (
    <>
      {/* Home Team Logo */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto">
          {match.homeTeamLogo ? (
            <Image
              src={match.homeTeamLogo}
              alt={match.homeTeamFull}
              title={match.homeTeamFull}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="text-gray-400 text-sm">🏒</span>
          )}
        </div>
      </td>

      {/* Dash */}
      <td className="px-2 py-3 whitespace-nowrap text-center text-gray-500">
        -
      </td>

      {/* Away Team Logo */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto">
          {match.awayTeamLogo ? (
            <Image
              src={match.awayTeamLogo}
              alt={match.awayTeamFull}
              title={match.awayTeamFull}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="text-gray-400 text-sm">🏒</span>
          )}
        </div>
      </td>

      {/* Result */}
      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
        {match.homeScore} - {match.awayScore}
      </td>

      {/* Game Date */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {formatShortDateFromString(match.date)}
      </td>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Wins Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Största hemmavinster
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {homeWins.length > 0 ? (
                  homeWins.map((match) => (
                    <tr
                      key={`home-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {renderMatchRow(match, true)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-gray-400 text-center"
                    >
                      Ingen data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Away Wins Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Största bortavinster
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {awayWins.length > 0 ? (
                  awayWins.map((match) => (
                    <tr
                      key={`away-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {renderMatchRow(match, false)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-gray-400 text-center"
                    >
                      Ingen data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highest Scoring Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Målrikaste
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highestScoring.length > 0 ? (
                  highestScoring.map((match) => (
                    <tr
                      key={`high-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {renderMatchRow(match, match.homeScore > match.awayScore)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-gray-400 text-center"
                    >
                      Ingen data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lowest Scoring Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Målsnålaste
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowestScoring.length > 0 ? (
                  lowestScoring.map((match) => (
                    <tr
                      key={`low-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {renderMatchRow(match, match.homeScore > match.awayScore)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-gray-400 text-center"
                    >
                      Ingen data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
