import React from "react";
import {GameInfo} from "@/app/types/domain/game";

interface ScoreOrStatusProps {
    gameInfo: GameInfo;
    isHomeTeam: boolean;
}

export const ScoreOrStatus: React.FC<ScoreOrStatusProps> = ({gameInfo, isHomeTeam}) => {
    const homeScore = gameInfo.homeTeamInfo.score as unknown as string | number;
    const awayScore = gameInfo.awayTeamInfo.score as unknown as string | number;
    const hasNA = String(homeScore).includes('N/A') || String(awayScore).includes('N/A');

    if (hasNA) {
        const now = new Date();
        const start = new Date(gameInfo.startDateTime);
        const threeHoursMs = 3 * 60 * 60 * 1000;
        const diff = start.getTime() - now.getTime();
        // If the start time is less than 3 hours from now (past or within next 3 hours)

        if (diff <= threeHoursMs) {
            return <span className="inline-flex items-center text-sm text-gray-500"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block mr-1"></span>Pågående</span>;
        }
        return <span className="inline-flex items-center text-sm text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block mr-1"></span>Saknas</span>;
    }

    const currentTeamScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;

    return <>
        <div className="text-sm font-bold text-gray-800">
            {currentTeamScore} - {opponentScore}
        </div>
        <div className="text-xs text-orange-400 font-medium">
            {((gameInfo.state && gameInfo.state.includes('Shootout')) || ('shootout' in gameInfo && gameInfo.shootout)) ? 'SO' : 'OT'}
        </div>
    </>
};
