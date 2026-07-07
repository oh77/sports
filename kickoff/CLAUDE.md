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
- `SeasonConfig[]` with a URL-facing `key`, per-league external season ids, exactly one `current: true`
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
   - Allsvenskan — pending API
   - Champions League — pending API
6. Landing page with combined upcoming matches (done for integrated leagues via `services/leagueData.ts`)
7. Polish (cache debug pages, error/loading states, accessibility, metadata)

## Data access

Pages/API routes call `src/app/services/leagueData.ts` (the per-league dispatch facade) — never a provider service directly. Leagues without an integration fall back to fixture data. PL provider chain: `services/pulseliveService.ts` → `utils/translators/pulseliveToDomain.ts`.
