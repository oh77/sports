import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TeamInfo } from '../../types/domain/team';
import { StatnetService } from '../../services/statnetService';
import { League } from '@/app/types/domain/league';

interface LeagueFooterProps {
  league: League;
  currentTeamCode?: string;
}

const LeagueFooter: React.FC<LeagueFooterProps> = ({ league, currentTeamCode }) => {
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);

        // Use LeagueService to handle API call and transformation
        const leagueService = new StatnetService(league);
        const teamList = await leagueService.fetchTeams();

        setTeams(teamList);
      } catch (err) {
        console.error('Failed to load team list:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [league]);


  const getLeagueLogo = () => {
    if (league === 'shl') {
      return "https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg";
    } else if (league === 'sdhl') {
      return "https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg";
    } else if (league === 'chl') {
      return "https://www.chl.hockey/static/img/logo.png";
    }
    return "";
  };

  const getLeagueName = () => {
    if (league === 'shl') return 'SHL';
    if (league === 'sdhl') return 'SDHL';
    if (league === 'chl') return 'CHL';
    return '';
  };

  if (loading) {
    return (
      <footer className="bg-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-32 mx-auto"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="w-12 h-12 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-800 py-8 mt-12">
      <div className="container mx-auto px-4">
        {/* League Logo and Team Logos */}
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
          {[
            // League logo as first item
            {
              key: `league-${league}`,
              href: `/${league}`,
              logo: getLeagueLogo(),
              alt: `${getLeagueName()} Logo`,
              tooltip: getLeagueName(),
              isLeague: true
            },
            // Team logos
            ...teams.sort((a, b) => a.full > b.full ? 1 : -1)
                .map((team, index) => ({
              key: `team-${team.code}-${index}`,
              href: `/${league}/${encodeURIComponent(team.code)}`,
              logo: team.logo,
              alt: team.full,
              tooltip: team.full,
              isCurrentTeam: currentTeamCode === team.code,
              isLeague: false
            }))
          ].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`group relative transition-all duration-200 ${
                'isCurrentTeam' in item && item.isCurrentTeam 
                  ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' 
                  : 'hover:scale-110'
              }`}
            >
              <div className={`w-12 h-12 ${item.isLeague ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center overflow-hidden`}>
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.alt}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-lg">🏒</span>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.tooltip}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default LeagueFooter
