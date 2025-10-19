import Image from "next/image";
import React from "react";
import {getDay, getMonth, getTime} from "@/app/utils/dateUtils";
import {GameInfo} from "@/app/types/domain/game";

interface HeadToHeadCircleProps {
    game: GameInfo;
}

const getTitle = (game: GameInfo, gameDate: Date) =>
    `${getDay(gameDate)} ${getMonth(gameDate)} | ${game.homeTeamInfo.teamInfo.code}-${game.awayTeamInfo.teamInfo.code} ${game.homeTeamInfo.score}-${game.awayTeamInfo.score} ${game.overtime ? '(OT)' : ''} ${game.shootout ? '(SO)' : ''}`;

const getWinnerAltText = (game: GameInfo) =>
    (game.homeTeamInfo.score > game.awayTeamInfo.score) ?
        `${game.homeTeamInfo.teamInfo.short} (H)` :
        `${game.awayTeamInfo.teamInfo.short} (B)`;



export const HeadToHeadCircle: React.FC<HeadToHeadCircleProps> = ({game}) => {

    const gameDate = new Date(game.startDateTime);
    const homeScore = game.homeTeamInfo.score;
    const awayScore = game.awayTeamInfo.score;

    // Check if game is finished
    const isFinished = game.state === 'finished';

    // Determine winner if game is finished
    let winnerLogo: string | undefined = undefined;
    if (isFinished) {
        if (homeScore > awayScore) {
            winnerLogo = game.homeTeamInfo.teamInfo.logo;
        } else if (awayScore > homeScore) {
            winnerLogo = game.awayTeamInfo.teamInfo.logo;
        }
    }

    if (winnerLogo) {
        return <Image
            src={winnerLogo}
            alt={`Vinnare: ${getWinnerAltText(game)}`}
            title={getTitle(game, gameDate)}
            width={48}
            height={48}
            className="w-10 h-10 object-contain"
        />;
    }

    const isToday = new Date(gameDate).toDateString() === new Date().toDateString();
    return <div
        className={`w-12 h-12 rounded-full border-2 border-gray-500 flex items-center justify-center overflow-hidden ${winnerLogo ? 'bg-white' : 'bg-white/50'}`}
        title={getTitle(game, gameDate)}>

        <div className="text-center text-xs text-gray-500 leading-tight font-bold">
        {isToday ? (
            <div>{getTime(gameDate)}</div>
        ) : (
            <div>{getDay(gameDate)}<br/>{getMonth(gameDate)}</div>
        )}
        </div>
    </div>;
};
