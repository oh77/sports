# Matchday (kickoff) - Project Context for AI Assistants

## Project Overview
Matchday is a Next.js web application that displays football (soccer) league information: **Allsvenskan** (`allsvenskan`), **Superettan** (`superettan`), **Premier League** (`pl`), **Champions League** (`cl`), **Europa League** (`el`), **Conference League** (`col`), and **Nations League** (`nl`, matches only). It shows match schedules, standings, and player statistics.

This app lives in the `kickoff/` folder of the Gameday repo but is a **standalone application** (own `package.json`, deployed as a separate Vercel app). It is modeled on the ice hockey app in the repo root — same architecture, different sport.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Biome + ESLint, Yarn
**Language:** Swedish (`lang="sv"`)

## Core Architectural Rule: The Application Contract

There is **one internal domain contract** (`src/app/types/domain/`) shared by all view models and frontend components. Every external API must be translated into this contract by a dedicated translator before it reaches an API route or page. **Components never import provider-specific types.**

Data flow, per league:

```
External API → service (fetch + cache) → translator (provider types → domain types)
             → Next.js API route → server component pages → shared UI components
```

## Project Structure

```
src/app/
├── api/                      # e.g. /api/pl-matches, /api/allsvenskan-standings, /api/cache/*
├── components/               # shared, league-agnostic UI (folder per component, index.tsx)
├── config/                   # league + season config
├── services/                 # one service per external provider
├── types/
│   ├── domain/               # THE application contract
│   └── <provider>/           # raw API types, one folder per provider
├── utils/
│   ├── cache.ts              # in-memory TTL cache (5 min matches, 15 min standings/stats)
│   └── translators/          # <provider>ToDomain.ts
└── [league]/[season]/        # league pages: overview, standings/, stats/, [teamCode]/
```

## Seasons

Config-driven, in `src/app/config/`:
- Per-league constants that don't change across seasons (provider, external competition ids)
- `SeasonConfig[]` with a URL-facing `key` and per-league external season ids
- **The default season is computed, not flagged**: `currentSeason()` picks the season in progress today, else the next upcoming, else the most recently ended (key implies the span: calendar year for `2026`, July–June for `25-26`). Add upcoming seasons to `LEAGUE_SEASONS` as soon as the provider has data for them.
- `resolveSeason(key?)` falls back to the current season for missing/unknown keys
- **Season key formats differ per league:** Allsvenskan is calendar-year (`2026`), PL/CL are cross-year (`25-26`)

## Checkpoint Protocol: External APIs

The maintainer provides all external API endpoints. **Never fabricate endpoint URLs, never scrape, never guess response shapes.** Before implementing a data integration (per league, per data type), stop and ask for:
1. Endpoint URL(s) + headers/auth/query params
2. A sample JSON response or schema
3. Field mappings if not obvious
4. Refresh cadence if it differs from default TTLs

Until an API is provided, keep that part of the UI running on fixture data.

## Code Conventions
- Server Components by default; `'use client'` only when needed
- No `any` types — TypeScript strict
- Components: PascalCase; files: kebab-case for utilities, camelCase for services
- Component folders under `src/app/components/<component-name>/` with `index.tsx`
- Tailwind utility-first, mobile-first (`sm:`, `md:`, `lg:`)
- Dark theme, distinct accent per league: Allsvenskan blue/yellow, PL purple, CL dark blue
- Accessibility: `<main>` landmarks, table `<caption>`s, ARIA tabs, `alt`/`aria-hidden` on decorative images, no color-only indicators
- Images: Vercel bills per transformation, so pass `unoptimized` for anything
  the optimizer can't improve — SVGs (via `skipsOptimizer()` in
  `utils/images.ts`) and sources already under ~10 KB, like the 70x70 UEFA
  flags. PNG team logos and the local PL logo stay optimized. Config caps
  live in `next.config.ts` (`minimumCacheTTL`, `qualities`, size allowlists)

## Commands

```bash
yarn dev             # Dev server (Turbopack)
yarn build           # Production build
yarn lint            # Biome lint
yarn lint:fix        # Biome lint --write
yarn eslint          # ESLint
yarn biome:fix       # Biome check --write (format + lint + organize imports)
```

Note: `.yarnrc` sets `ignore-engines true` (local Node 23 vs some packages' engine ranges).

## Verification Rules
- After each change set: `npx tsc --noEmit`, `yarn lint`, and `yarn build` must pass
- **Do not start the dev server or run browser tests** — the maintainer verifies at runtime manually
- No test framework; TypeScript + Biome + build are the quality gates

## Build Plan Status
Full build plan: `football-gameday-prompt.md`
1. ✅ Scaffold
2. ✅ Domain contract (`types/domain/`) — signed off
3. ✅ Config & utilities (seasons, cache, dates)
4. ✅ UI shell with fixture data (`src/app/utils/fixtures.ts` drives all pages)
5. League integrations — ask for APIs per checkpoint protocol
   - ✅ **Premier League** (pulselive; endpoints in `docs/endpoints/premierleague.md`): matches (v2, window of matchweeks around current from standings), standings, player stats leaderboard, teams + badge SVGs. **Gap:** no keeper-stats endpoint yet, so the Målvakter tab is hidden for PL.
   - ✅ **Allsvenskan** (sportomedia GraphQL at gql.sportomedia.se; endpoints in `docs/endpoints/allssvenskan.md`): full-season matches, standings (named stat cells gp/w/t/l/gf/ga/d/pts), all-player statistics (sorted client-side), teams + PNG logos. Form is computed from finished matches (`utils/form.ts`) since the provider's form field was null in samples. **Gap:** no keeper stats in the statistics query, so the Målvakter tab is hidden here too. Match payloads carry no logos — the facade joins them in from the teams query.
   - ✅ **Champions League** (UEFA micro-services; endpoints in `docs/endpoints/uefa_champions_league_api.md`): full tournament schedule (paged from match.uefa.com), standings (league phase + any group/knockout mini-tables), player leaderboards from compstats.uefa.com — that host is **origin-locked**, so the service sends `Origin: https://www.uefa.com`. Player stats use compstats **v2** `player-ranking`: one request per view returns several metrics per row (`statistics: [{ name, value }]`, values as strings, no rank field), ranked by the first `stats` code — goals view `goals,assists,matches_appearance`, assists view `assists,goals,…`, cards view `yellow_cards,red_cards,…` (see `UEFA_RANKING_STATS`). Stat tabs show GP/G/A/TP (cards: GP/YC/RC). Teams derive from standings (comp.uefa.com is origin-locked), falling back to the schedule; form computed from the schedule. Standings/player-ranking 404 before the league-phase draw — mapped to empty data, and the tables render "inte tillgänglig ännu" messages. The v2 row shape is typed from a captured Nations League sample (endpoint doc §3a); the cards codes are carried over from v1 and not yet sampled on v2.
   - ✅ **Superettan** (`superettan`) — same sportomedia GraphQL chain as Allsvenskan, only `configLeagueName=superettan`. No new provider code: `sportomediaService` fetchers take the league name as a parameter (and key their cache by it), and `sportomediaStandingsToDomain` picks the zone function per league — Superettan promotes 1-2, sends 3-4 to the promotion play-off, 13-14 to the relegation play-off and relegates 15-16. Logo is remote (`superettan.se`, allowlisted in `next.config.ts`), accent green (`#2f9e5e` — the logo's dominant green `#166938`, lightened for contrast on the dark surfaces). Seasons mirror Allsvenskan (2026, 2025).
   - ✅ **Conference League** (`col`) — same UEFA micro-services and same `uefaService`/`uefaToDomain` chain as CL, only `competitionId=2019` (vs `1`). No new provider code: `leagueData.ts` picks the competition id per league, `uefaService` fetchers take it as a parameter (and key their cache by it), and `uefaPlayerPhotoUrl` uses it in the image path. Logo is a local asset (`public/assets/conference-league-logo.svg`, from Wikimedia), accent green. Seasons mirror CL. `docs/endpoints/uefa_champions_league_api.md` covers both competitions.
   - ✅ **Nations League** (`nl`) — **matches only.** Same UEFA chain, `competitionId=2014`, seasons run every other year (only 2026/27 = `seasonYear=2027` is verified). Teams are national teams but carry `logoUrl` like clubs; the team list derives from the schedule. `hasStandingsAndStats()` in `config/leagues.ts` marks it matches-only: the Tabell/Statistik nav items, landing-page links and overview sidebar are hidden (the overview doesn't fetch standings or player stats at all), and `/standings` and `/stats` 404. `getStandings` and `getPlayerStats` do fetch (same `standings.uefa.com` / `compstats.uefa.com` v2 queries as CL) so the team and matchup pages can show a table excerpt within the team's group and each team's top scorer — both pages treat standings and leaders as optional (errors caught, empty → hidden). Zones are disabled for `nl` since `clZone` models the club formats. The team list still derives from the schedule, so a standings problem can't take team pages down. Logo is UEFA's remote competition SVG (`…/competitions/color/full/2014.svg`), accent cyan. **Gap:** Nations League-specific round names (e.g. promotion/relegation play-offs, third-place match) aren't in the Swedish `KNOCKOUT_ROUNDS` map, so they show the provider's English label until mapped.
6. Landing page with combined upcoming matches (done for integrated leagues via `services/leagueData.ts`)
7. Polish (cache debug pages, error/loading states, accessibility, metadata)

## Data access

Pages/API routes call `src/app/services/leagueData.ts` (the per-league dispatch facade) — never a provider service directly. Provider chains: PL `pulseliveService` → `pulseliveToDomain`; Allsvenskan + Superettan `sportomediaService` → `sportomediaToDomain` (the league name is threaded through as `configLeagueName`); CL + Europa League + Conference League + Nations League `uefaService` → `uefaToDomain`. CL and Conference League share the whole UEFA chain — the only difference is the `competitionId` (`1` for CL, `2019` for Conference League), chosen per league in `leagueData.ts` and threaded through the service + player-photo URL. All four leagues run on live data; `utils/fixtures.ts` is retained as a reference/offline dataset but is no longer wired in. Keeper stats: no provider exposes them yet, `getKeeperStats()` returns null everywhere.
