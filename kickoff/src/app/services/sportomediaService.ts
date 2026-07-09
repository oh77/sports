import {
  ALLSVENSKAN_LEAGUE_NAME,
  SPORTOMEDIA_GQL,
} from '@/app/config/sportomedia';
import type {
  SportomediaMatch,
  SportomediaMatchesData,
} from '@/app/types/sportomedia/matches';
import type {
  SportomediaPlayer,
  SportomediaStatisticsData,
} from '@/app/types/sportomedia/players';
import type {
  SportomediaStanding,
  SportomediaStandingsData,
} from '@/app/types/sportomedia/standings';
import type {
  SportomediaTeam,
  SportomediaTeamsData,
} from '@/app/types/sportomedia/teams';
import { generateCacheKey, getCachedData, TTL } from '@/app/utils/cache';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function gqlQuery<T>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(SPORTOMEDIA_GQL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables, operationName }),
  });
  if (!res.ok) {
    throw new Error(
      `Sportomedia request failed (${res.status}): ${operationName}`,
    );
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length || !json.data) {
    const message = json.errors?.map((e) => e.message).join('; ') ?? 'no data';
    throw new Error(`Sportomedia GraphQL error (${operationName}): ${message}`);
  }
  return json.data;
}

const TEAMS_QUERY = `
  query teams($configLeagueName: String!, $configSeasonStartYear: Int!) {
    teamsForLeague(
      configLeagueName: $configLeagueName
      configSeasonStartYear: $configSeasonStartYear
    ) {
      teams {
        abbrv
        everySportId
        displayName
        name
        logoImageUrl
      }
    }
  }
`;

export async function fetchAllsvenskanTeams(
  seasonStartYear: number,
): Promise<SportomediaTeam[]> {
  const data = await getCachedData<SportomediaTeamsData>(
    generateCacheKey('allsvenskan-teams', { season: String(seasonStartYear) }),
    () =>
      gqlQuery('teams', TEAMS_QUERY, {
        configLeagueName: ALLSVENSKAN_LEAGUE_NAME,
        configSeasonStartYear: seasonStartYear,
      }),
  );
  return data.teamsForLeague.teams;
}

const MATCHES_QUERY = `
  query matchesForLeague(
    $configLeagueName: String!
    $configSeasonStartYear: Int!
    $startDate: String
    $endDate: String
  ) {
    matchesForLeague(
      configLeagueName: $configLeagueName
      configSeasonStartYear: $configSeasonStartYear
      startDate: $startDate
      endDate: $endDate
    ) {
      matches {
        id
        startDate
        homeTeamName
        visitingTeamName
        homeTeamNameFormatted
        visitingTeamNameFormatted
        homeTeamAbbrv
        visitingTeamAbbrv
        homeTeamEverySportId
        visitingTeamEverySportId
        homeTeamScore
        visitingTeamScore
        status
        extendedStatus
        period
        matchMinute
        round
        arenaName
      }
    }
  }
`;

/** The full season schedule (all rounds) in one call. */
export async function fetchAllsvenskanMatches(
  seasonStartYear: number,
): Promise<SportomediaMatch[]> {
  const data = await getCachedData<SportomediaMatchesData>(
    generateCacheKey('allsvenskan-matches', {
      season: String(seasonStartYear),
    }),
    () =>
      gqlQuery('matchesForLeague', MATCHES_QUERY, {
        configLeagueName: ALLSVENSKAN_LEAGUE_NAME,
        configSeasonStartYear: seasonStartYear,
      }),
    TTL.matches,
  );
  return data.matchesForLeague.matches;
}

const STANDINGS_QUERY = `
  query StandingsForLeague(
    $configLeagueName: String!
    $configSeasonStartYear: Int!
    $type: String!
  ) {
    standingsForLeague(
      configLeagueName: $configLeagueName
      configSeasonStartYear: $configSeasonStartYear
      type: $type
    ) {
      standings {
        teamAbbrv
        teamName
        position
        previousPosition
        stats {
          value
          name
        }
        teamId
      }
    }
  }
`;

export async function fetchAllsvenskanStandings(
  seasonStartYear: number,
): Promise<SportomediaStanding[]> {
  const data = await getCachedData<SportomediaStandingsData>(
    generateCacheKey('allsvenskan-standings', {
      season: String(seasonStartYear),
    }),
    () =>
      gqlQuery('StandingsForLeague', STANDINGS_QUERY, {
        configLeagueName: ALLSVENSKAN_LEAGUE_NAME,
        configSeasonStartYear: seasonStartYear,
        type: 'total',
      }),
    TTL.standings,
  );
  return data.standingsForLeague.standings;
}

const STATISTICS_QUERY = `
  query statistics($configLeagueName: String!, $configSeasonStartYear: Int!) {
    statistics(
      configLeagueName: $configLeagueName
      configSeasonStartYear: $configSeasonStartYear
    ) {
      player {
        displayName
        givenName
        surName
        nationality
        position
        birthDate
        teamAbbrv
        teamDisplayName
        teamLogo
        playerImage
        fogisId
        matchesPlayed
        penaltyGoals
        yellowCards
        redCards
        goals
        assists
      }
    }
  }
`;

/** All players' season statistics (unsorted — callers sort). */
export async function fetchAllsvenskanPlayers(
  seasonStartYear: number,
): Promise<SportomediaPlayer[]> {
  const data = await getCachedData<SportomediaStatisticsData>(
    generateCacheKey('allsvenskan-players', {
      season: String(seasonStartYear),
    }),
    () =>
      gqlQuery('statistics', STATISTICS_QUERY, {
        configLeagueName: ALLSVENSKAN_LEAGUE_NAME,
        configSeasonStartYear: seasonStartYear,
      }),
    TTL.stats,
  );
  return data.statistics.player;
}
