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
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-6 bg-surface-3 rounded mb-4"></div>
            <div className="h-64 bg-surface-3 rounded"></div>
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
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="p-8 text-center text-dim">
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
        <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center overflow-hidden mx-auto">
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
            <span className="text-mute text-sm">🏒</span>
          )}
        </div>
      </td>

      {/* Dash */}
      <td className="px-2 py-3 whitespace-nowrap text-center text-mute">-</td>

      {/* Away Team Logo */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center overflow-hidden mx-auto">
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
            <span className="text-mute text-sm">🏒</span>
          )}
        </div>
      </td>

      {/* Result */}
      <td className="px-4 py-3 whitespace-nowrap text-sm num font-semibold text-ink">
        {match.homeScore} - {match.awayScore}
      </td>

      {/* Game Date */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dim">
        {formatShortDateFromString(match.date)}
      </td>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Wins Table */}
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]"
                  >
                    Största hemmavinster
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {homeWins.length > 0 ? (
                  homeWins.map((match) => (
                    <tr
                      key={`home-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {renderMatchRow(match, true)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-mute text-center"
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
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]"
                  >
                    Största bortavinster
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {awayWins.length > 0 ? (
                  awayWins.map((match) => (
                    <tr
                      key={`away-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {renderMatchRow(match, false)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-mute text-center"
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
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]"
                  >
                    Målrikaste
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {highestScoring.length > 0 ? (
                  highestScoring.map((match) => (
                    <tr
                      key={`high-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {renderMatchRow(match, match.homeScore > match.awayScore)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-mute text-center"
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
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-left text-xs text-mute display uppercase tracking-[0.06em]"
                  >
                    Målsnålaste
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {lowestScoring.length > 0 ? (
                  lowestScoring.map((match) => (
                    <tr
                      key={`low-${match.date}-${match.homeTeam}-${match.awayTeam}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {renderMatchRow(match, match.homeScore > match.awayScore)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-mute text-center"
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
