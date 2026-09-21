import type { GameInfo } from '@/app/types/domain/game';

/**
 * A drawn game is its own result, not a loss: a CHL playoff leg is settled on
 * aggregate, so a level leg breaks both a winning and a losing run.
 */
export type StreakType = 'win' | 'loss' | 'draw';

/** A finished game's result for one team. */
function resultFor(teamScore: number, opponentScore: number): StreakType {
  if (teamScore > opponentScore) return 'win';
  if (teamScore < opponentScore) return 'loss';
  return 'draw';
}

export interface TeamStreak {
  teamCode: string;
  teamName: string;
  teamFullName: string;
  teamLogo: string | null;
  streak: number;
  streakType: StreakType;
  longestWinStreak: number;
  longestLossStreak: number;
}

export function calculateStreaks(games: GameInfo[]): TeamStreak[] {
  // Sort games by date, most recent first
  const sortedGames = [...games]
    .filter((game) => game.state === 'finished')
    .sort(
      (a, b) =>
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime(),
    );

  // Map to track team info and their games
  const teamInfo = new Map<
    string,
    {
      teamCode: string;
      teamName: string;
      teamFullName: string;
      teamLogo: string | null;
    }
  >();

  // Map to track games per team (most recent first)
  const teamGames = new Map<string, StreakType[]>();

  // Collect all team info and their game results
  sortedGames.forEach((game) => {
    const homeCode = game.homeTeamInfo.teamInfo.code;
    const awayCode = game.awayTeamInfo.teamInfo.code;
    const homeScore = game.homeTeamInfo.score;
    const awayScore = game.awayTeamInfo.score;

    // Store team info
    if (!teamInfo.has(homeCode)) {
      teamInfo.set(homeCode, {
        teamCode: homeCode,
        teamName: game.homeTeamInfo.teamInfo.short,
        teamFullName: game.homeTeamInfo.teamInfo.full,
        teamLogo: game.homeTeamInfo.teamInfo.logo || null,
      });
    }
    if (!teamInfo.has(awayCode)) {
      teamInfo.set(awayCode, {
        teamCode: awayCode,
        teamName: game.awayTeamInfo.teamInfo.short,
        teamFullName: game.awayTeamInfo.teamInfo.full,
        teamLogo: game.awayTeamInfo.teamInfo.logo || null,
      });
    }

    // Store game results
    if (!teamGames.has(homeCode)) {
      teamGames.set(homeCode, []);
    }
    if (!teamGames.has(awayCode)) {
      teamGames.set(awayCode, []);
    }

    teamGames.get(homeCode)?.push(resultFor(homeScore, awayScore));
    teamGames.get(awayCode)?.push(resultFor(awayScore, homeScore));
  });

  // Calculate streaks for each team
  const streaks: TeamStreak[] = [];

  teamInfo.forEach((info, teamCode) => {
    const games = teamGames.get(teamCode) || [];

    if (games.length === 0) {
      return;
    }

    // Count consecutive same results from the most recent game (current streak)
    let streak = 1;
    const streakType = games[0];

    // Continue counting backwards until streak breaks
    for (let i = 1; i < games.length; i++) {
      if (games[i] === streakType) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    // Calculate longest win and loss streaks
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    games.forEach((result) => {
      if (result === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > longestWinStreak) {
          longestWinStreak = currentWinStreak;
        }
      } else if (result === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > longestLossStreak) {
          longestLossStreak = currentLossStreak;
        }
      } else {
        // A draw ends both runs without starting one of its own.
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    if (streak > 0) {
      streaks.push({
        teamCode: info.teamCode,
        teamName: info.teamName,
        teamFullName: info.teamFullName,
        teamLogo: info.teamLogo,
        streak,
        streakType,
        longestWinStreak,
        longestLossStreak,
      });
    }
  });

  // Sort: win streaks first (by length descending), then draws, then loss
  // streaks (by length ascending - smaller losses rank higher)
  const typeRank: Record<StreakType, number> = { win: 0, draw: 1, loss: 2 };
  streaks.sort((a, b) => {
    // Wins always come before draws, which come before losses
    if (a.streakType !== b.streakType) {
      return typeRank[a.streakType] - typeRank[b.streakType];
    }
    // If same type
    if (a.streakType === 'win' || a.streakType === 'draw') {
      // Sort by length descending (largest first)
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
    } else {
      // Loss streaks: sort by length ascending (smallest first - 1 loss ranks higher than 2 losses)
      if (a.streak !== b.streak) {
        return a.streak - b.streak;
      }
    }
    // If same streak length and type, sort by team name
    return a.teamName.localeCompare(b.teamName);
  });

  return streaks;
}
