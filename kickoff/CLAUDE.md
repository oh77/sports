# Matchday (kickoff) - Project Context for AI Assistants

## Project Overview
Matchday is a Next.js web application that displays football (soccer) league information: **Allsvenskan** (`allsvenskan`), **Premier League** (`pl`), and **Champions League** (`cl`). It shows match schedules, standings, and player statistics.

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
   - ✅ **Champions League** (UEFA micro-services; endpoints in `docs/endpoints/uefa_champions_league_api.md`): full tournament schedule (paged from match.uefa.com), standings (league phase + any group/knockout mini-tables), player leaderboards from compstats.uefa.com — that host is **origin-locked**, so the service sends `Origin: https://www.uefa.com`. One metric per ranking request, so CL stat tabs show single-metric columns (cards merges yellow+red rankings). Teams derive from standings (comp.uefa.com is origin-locked), falling back to the schedule; form computed from the schedule. Standings/player-ranking 404 before the league-phase draw — mapped to empty data, and the tables render "inte tillgänglig ännu" messages. **Note:** the player-ranking response shape is typed defensively from a terse doc description — if it breaks, capture a browser sample.
6. Landing page with combined upcoming matches (done for integrated leagues via `services/leagueData.ts`)
7. Polish (cache debug pages, error/loading states, accessibility, metadata)

## Data access

Pages/API routes call `src/app/services/leagueData.ts` (the per-league dispatch facade) — never a provider service directly. Provider chains: PL `pulseliveService` → `pulseliveToDomain`; Allsvenskan `sportomediaService` → `sportomediaToDomain`; CL `uefaService` → `uefaToDomain`. All three leagues run on live data; `utils/fixtures.ts` is retained as a reference/offline dataset but is no longer wired in. Keeper stats: no provider exposes them yet, `getKeeperStats()` returns null everywhere.
