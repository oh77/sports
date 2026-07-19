import type {
  KeeperStats,
  KeeperStatsData,
} from '@/app/types/domain/keeper-stats';
import type { League } from '@/app/types/domain/league';
import type {
  MatchesData,
  MatchInfo,
  MatchState,
} from '@/app/types/domain/match';
import type {
  PlayerInfo,
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import type {
  MatchOutcome,
  StandingsData,
  StandingsZone,
  TeamStanding,
} from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import {
  KEEPER_COLUMNS,
  playerColumns,
  STANDINGS_COLUMNS,
} from '@/app/utils/footballColumns';

/**
 * Deterministic fixture data in the domain contract. This drives the whole UI
 * until the real API integrations land (see the checkpoint protocol in
 * CLAUDE.md), and is then replaced league by league. Player names are
 * fictional on purpose.
 */

const team = (code: string, short: string, long: string): TeamInfo => ({
  code,
  externalId: `fixture-${code}`,
  short,
  long,
  full: long,
  logo: '',
});

const FIXTURE_TEAMS: Record<League, TeamInfo[]> = {
  allsvenskan: [
    team('mff', 'MFF', 'Malmö FF'),
    team('aik', 'AIK', 'AIK'),
    team('dif', 'DIF', 'Djurgårdens IF'),
    team('ham', 'HAM', 'Hammarby IF'),
    team('ifkg', 'IFKG', 'IFK Göteborg'),
    team('hacken', 'HÄC', 'BK Häcken'),
    team('elfsborg', 'ELF', 'IF Elfsborg'),
    team('ifkn', 'IFKN', 'IFK Norrköping'),
  ],
  pl: [
    team('arsenal', 'ARS', 'Arsenal'),
    team('liverpool', 'LIV', 'Liverpool'),
    team('man-city', 'MCI', 'Manchester City'),
    team('chelsea', 'CHE', 'Chelsea'),
    team('man-united', 'MUN', 'Manchester United'),
    team('tottenham', 'TOT', 'Tottenham'),
    team('newcastle', 'NEW', 'Newcastle'),
    team('aston-villa', 'AVL', 'Aston Villa'),
  ],
  cl: [
    team('real-madrid', 'RMA', 'Real Madrid'),
    team('barcelona', 'BAR', 'FC Barcelona'),
    team('bayern', 'FCB', 'Bayern München'),
    team('psg', 'PSG', 'Paris Saint-Germain'),
    team('inter', 'INT', 'Inter'),
    team('arsenal', 'ARS', 'Arsenal'),
    team('liverpool', 'LIV', 'Liverpool'),
    team('dortmund', 'BVB', 'Borussia Dortmund'),
  ],
  col: [
    team('fiorentina', 'FIO', 'Fiorentina'),
    team('villarreal', 'VIL', 'Villarreal'),
    team('az', 'AZ', 'AZ Alkmaar'),
    team('gent', 'GNT', 'KAA Gent'),
    team('slavia', 'SLA', 'Slavia Prag'),
    team('rapid', 'RAP', 'Rapid Wien'),
    team('molde', 'MOL', 'Molde'),
    team('legia', 'LEG', 'Legia Warszawa'),
  ],
};

export function fixtureTeams(league: League): TeamInfo[] {
  return FIXTURE_TEAMS[league];
}

/** Round-robin pairings for a round, via the circle method. */
function roundPairings(
  teams: TeamInfo[],
  round: number,
): [TeamInfo, TeamInfo][] {
  const n = teams.length;
  const others = teams.slice(1);
  const rotated = others.map((_, i) => others[(i + round) % (n - 1)]);
  const line = [teams[0], ...rotated];
  const pairs: [TeamInfo, TeamInfo][] = [];
  for (let i = 0; i < n / 2; i++) {
    pairs.push([line[i], line[n - 1 - i]]);
  }
  return pairs;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Current matchday number the fixture schedule is centered on. */
const CURRENT_ROUND = 12;

/** Day offsets (relative to now) for the five generated rounds. */
const ROUND_OFFSETS = [-8, -4, 0, 4, 8];

export function fixtureMatches(league: League): MatchesData {
  const teams = FIXTURE_TEAMS[league];
  const now = Date.now();
  const matches: MatchInfo[] = [];

  ROUND_OFFSETS.forEach((dayOffset, roundIdx) => {
    const round = CURRENT_ROUND + roundIdx - 2;
    const pairs = roundPairings(teams, round);

    pairs.forEach(([home, away], i) => {
      // Today's round mixes states: finished, live, and two upcoming.
      const kickoffOffset =
        dayOffset === 0
          ? [-4 * HOUR, -1 * HOUR, 2 * HOUR, 4 * HOUR][i]
          : dayOffset * DAY + (i % 2 === 0 ? 15 : 17.5) * HOUR - 12 * HOUR;
      const startDateTime = new Date(now + kickoffOffset).toISOString();

      let state: MatchState = 'not-started';
      if (dayOffset < 0 || (dayOffset === 0 && i === 0)) state = 'finished';
      else if (dayOffset === 0 && i === 1) state = 'live';

      const finishedOrLive = state !== 'not-started';
      const homeScore = finishedOrLive ? (round + i * 2) % 4 : 0;
      let awayScore = finishedOrLive ? (round + i) % 3 : 0;

      // Give the CL's oldest round a knockout flavor for UI testing.
      const knockout = league === 'cl' && roundIdx === 0 && i < 2;
      if (knockout) awayScore = homeScore;

      matches.push({
        uuid: `${league}-r${round}-m${i}`,
        startDateTime,
        state,
        homeTeamInfo: {
          teamInfo: home,
          score: homeScore,
          ...(knockout && i === 1 ? { penaltyScore: 4 } : {}),
        },
        awayTeamInfo: {
          teamInfo: away,
          score: awayScore,
          ...(knockout && i === 1 ? { penaltyScore: 2 } : {}),
        },
        venueInfo: { name: `${home.short} Arena` },
        round,
        roundLabel: `Omgång ${round}`,
        ...(knockout && i === 0 ? { extraTime: true } : {}),
        ...(knockout && i === 1 ? { extraTime: true, penalties: true } : {}),
      });
    });
  });

  return { matches };
}

function zoneForRank(
  league: League,
  rank: number,
  total: number,
): StandingsZone | undefined {
  if (league === 'cl') {
    if (rank <= 2) return 'knockout';
    if (rank <= 4) return 'knockoutPlayoff';
    return undefined;
  }
  if (rank === 1) return 'title';
  if (rank <= 3) return 'championsLeague';
  if (rank === 4) return 'europe';
  if (rank === total - 1) return 'relegationPlayoff';
  if (rank === total) return 'relegation';
  return undefined;
}

const FORM_PATTERNS: MatchOutcome[][] = [
  ['W', 'W', 'D', 'W', 'W'],
  ['W', 'D', 'W', 'L', 'W'],
  ['L', 'W', 'W', 'D', 'W'],
  ['W', 'L', 'D', 'W', 'D'],
  ['D', 'L', 'W', 'D', 'L'],
  ['L', 'D', 'L', 'W', 'D'],
  ['D', 'L', 'L', 'D', 'L'],
  ['L', 'L', 'D', 'L', 'L'],
];

export function fixtureStandings(league: League): StandingsData {
  const teams = FIXTURE_TEAMS[league];
  const gp = CURRENT_ROUND - 1;

  const stats: TeamStanding[] = teams.map((info, i) => {
    const rank = i + 1;
    const w = Math.max(gp - 2 - i, 0);
    const d = Math.min(i % 3, gp - w);
    const l = gp - w - d;
    const gf = 26 - i * 2;
    const ga = 9 + i * 2;
    return {
      Rank: rank,
      GP: gp,
      W: w,
      D: d,
      L: l,
      GF: gf,
      GA: ga,
      GD: gf - ga,
      Points: w * 3 + d,
      zone: zoneForRank(league, rank, teams.length),
      form: FORM_PATTERNS[i % FORM_PATTERNS.length],
      info,
    };
  });

  return { dataColumns: STANDINGS_COLUMNS, stats };
}

/** Fictional player names per league — never real people. */
const PLAYER_NAMES: Record<League, string[]> = {
  allsvenskan: [
    'Isak Bergström',
    'Viktor Lundqvist',
    'Elias Norrby',
    'Hugo Sandell',
    'Melker Åkerlund',
    'Adam Sjövik',
    'Nils Vinterhag',
    'Oscar Melin',
    'Filip Rydholm',
    'Leo Stenmark',
  ],
  pl: [
    'Harry Whitfield',
    'Jamal Okoye',
    'Callum Rhodes',
    'Theo Ashworth',
    'Marcus Bellingley',
    'Kieran Doyle',
    'Reece Halloran',
    'Dominic Ferris',
    'Aaron Whitlock',
    'Joel Tremaine',
  ],
  cl: [
    'Rafael Souto',
    'Luca Ferranti',
    'Mateo Ibáñez',
    'Kylian Moreau',
    'Jonas Weidmann',
    'Andrej Kovac',
    'Thiago Valente',
    'Emre Kaplan',
    'Pavel Horák',
    'Nicolás Ferreyra',
  ],
  col: [
    'Matteo Bianchi',
    'Lars Veenstra',
    'Tomas Novotný',
    'Dragan Petrović',
    'Sander Aalbu',
    'Kamil Zieliński',
    'Bruno Salgado',
    'Niklas Roth',
    'Yannis Papadakis',
    'Ivan Marković',
  ],
};

const NATIONALITY: Record<League, string> = {
  allsvenskan: 'SWE',
  pl: 'ENG',
  cl: 'ESP',
  col: 'ITA',
};

function fixturePlayer(
  league: League,
  name: string,
  i: number,
  position: string,
): PlayerInfo {
  const teams = FIXTURE_TEAMS[league];
  const t = teams[i % teams.length];
  const [firstName, ...rest] = name.split(' ');
  return {
    uuid: `fixture-${league}-player-${i}-${position}`,
    fullName: name,
    firstName,
    lastName: rest.join(' '),
    nationality: NATIONALITY[league],
    position,
    number: ((i * 7) % 30) + 1,
    team: {
      externalId: t.externalId,
      name: t.long,
      code: t.code,
    },
  };
}

export function fixturePlayerStats(league: League): PlayerStatsData {
  const stats: PlayerStats[] = PLAYER_NAMES[league].map((name, i) => {
    const g = 14 - i;
    const a = (i * 3) % 7;
    return {
      Rank: i + 1,
      GP: CURRENT_ROUND - 1,
      G: g,
      A: a,
      TP: g + a,
      YC: (i * 2) % 5,
      RC: i % 5 === 4 ? 1 : 0,
      MIN: 990 - i * 45,
      info: fixturePlayer(league, name, i, i % 3 === 0 ? 'FW' : 'MF'),
    };
  });

  return {
    dataColumns: playerColumns('G'),
    defaultSortKey: { name: 'G', order: 'desc' },
    stats,
  };
}

const KEEPER_NAMES: Record<League, string[]> = {
  allsvenskan: [
    'Anton Wikblad',
    'Erik Malmsten',
    'Jonatan Hellgren',
    'Simon Dahlqvist',
    'Ludvig Ekefjärd',
  ],
  pl: [
    'Nathan Prescott',
    'Oliver Grayling',
    'Lewis Hartfield',
    'Ben Cavanagh',
    'Freddie Loxton',
  ],
  cl: [
    'Iker Zubeldia',
    'Gianluigi Moretti',
    'Timo Reinhardt',
    'Aleksander Novak',
    'Diego Sarmiento',
  ],
  col: [
    'Marco Ferretti',
    'Sven Bakker',
    'Petr Svoboda',
    'Goran Ilić',
    'Henrik Sørland',
  ],
};

export function fixtureKeeperStats(league: League): KeeperStatsData {
  const gp = CURRENT_ROUND - 1;
  const stats: KeeperStats[] = KEEPER_NAMES[league].map((name, i) => {
    const ga = 6 + i * 3;
    return {
      Rank: i + 1,
      GP: gp,
      CS: 7 - i,
      GA: ga,
      GAA: (ga / gp).toFixed(2),
      info: fixturePlayer(league, name, i, 'GK'),
    };
  });

  return {
    dataColumns: KEEPER_COLUMNS,
    defaultSortKey: { name: 'CS', order: 'desc' },
    stats,
  };
}
