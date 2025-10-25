import Link from "next/link";
import Image from "next/image";
import React from "react";
import {League} from "@/app/types/domain/league";
import {TeamInfo} from "@/app/types/domain/team";

interface ClickableTeamLogoProps {
    league: League;
    teamInfo: TeamInfo;
}

const ClickableTeamLogo: React.FC<ClickableTeamLogoProps> = ({league, teamInfo}) => {
    return (
        <Link
            href={`/${league}/${encodeURIComponent(teamInfo.code)}`}
            title={teamInfo.full}
            className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                {teamInfo.logo ? (
                    <Image
                        src={teamInfo.logo}
                        alt={teamInfo.short}
                        width={league === 'shl' ? 48 : 64}
                        height={league === 'shl' ? 48 : 64}
                        className={`object-contain ${league === 'shl' ? 'w-12 h-12' : 'w-16 h-16'}`}
                    />
                ) : (
                    <span className="text-gray-400 text-xl">{teamInfo.code}</span>
                )}
            </div>

        </Link>
    )
}

export default ClickableTeamLogo;
