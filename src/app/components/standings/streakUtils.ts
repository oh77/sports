import type { GameInfo } from '@/app/types/domain/game';

export interface TeamStreak {
  teamCode: string;
  teamName: string;
  teamFullName: string;
  teamLogo: string | null;
  streak: number;
  streakType: 'win' | 'loss';
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
  const teamGames = new Map<string, Array<{ won: boolean }>>();

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

    teamGames.get(homeCode)!.push({ won: homeScore > awayScore });
    teamGames.get(awayCode)!.push({ won: awayScore > homeScore });
  });

  // Calculate streaks for each team
  const streaks: TeamStreak[] = [];

  teamInfo.forEach((info, teamCode) => {
    const games = teamGames.get(teamCode) || [];

    if (games.length === 0) {
      return;
    }

    // Count consecutive wins or losses from the most recent game
    const firstResult = games[0];
    let streak = 1;
    const streakType: 'win' | 'loss' = firstResult.won ? 'win' : 'loss';

    // Continue counting backwards until streak breaks
    for (let i = 1; i < games.length; i++) {
      const currentResult = games[i];
      const currentType = currentResult.won ? 'win' : 'loss';

      if (currentType === streakType) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    if (streak > 0) {
      streaks.push({
        teamCode: info.teamCode,
        teamName: info.teamName,
        teamFullName: info.teamFullName,
        teamLogo: info.teamLogo,
        streak,
        streakType,
      });
    }
  });

  // Sort: win streaks first (by length descending), then loss streaks (by length ascending - smaller losses rank higher)
  streaks.sort((a, b) => {
    // Wins always come before losses
    if (a.streakType !== b.streakType) {
      return a.streakType === 'win' ? -1 : 1;
    }
    // If same type
    if (a.streakType === 'win') {
      // Win streaks: sort by length descending (largest first)
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
