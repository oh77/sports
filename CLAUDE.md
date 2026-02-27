# Gameday - Project Context for AI Assistants

## Project Overview
Gameday is a Next.js web application that displays Swedish hockey league information (CHL, SHL, and SDHL). It provides real-time game schedules, standings, player statistics, and team information.

**Live URL:** (Add if deployed)
**Tech Stack:** Next.js 15.5.7 (App Router), React 19, TypeScript, Tailwind CSS 4
**Language:** Swedish (sv)

## Architecture

### Framework & Configuration
- **Next.js App Router** with Turbopack for development
- **TypeScript** strict mode enabled
- **Tailwind CSS 4** with PostCSS
- **Code Quality:** Biome for linting/formatting, ESLint for additional checks
- **Analytics:** Vercel Analytics and Speed Insights integrated

### Project Structure
```
src/app/
├── api/                    # API routes for data fetching
│   ├── cache/             # Cache management endpoints
│   ├── chl-*/             # CHL league endpoints
│   ├── shl-*/             # SHL league endpoints
│   └── sdhl-*/            # SDHL league endpoints
├── components/            # Reusable React components
│   ├── game-container/    # Game display components
│   ├── standings/         # League standings tables
│   ├── top-players/       # Player statistics displays
│   ├── tabs/              # Tab navigation component
│   └── ...
├── services/              # External API integration services
│   ├── statnetService.ts  # SHL/SDHL data fetching
│   └── chlService.ts      # CHL data fetching
├── types/                 # TypeScript type definitions
│   ├── domain/            # Domain models (normalized)
│   ├── statnet/           # Statnet API types
│   └── chl/               # CHL API types
├── utils/                 # Utility functions
│   ├── cache.ts           # Caching utilities
│   ├── translators/       # API to domain model converters
│   └── ...
└── [league]/              # League-specific pages
    ├── page.tsx           # League overview
    ├── standings/         # Standings page
    └── [teamCode]/        # Team detail pages
```

### Data Flow
1. **External APIs:** Statnet (SHL/SDHL) and CHL endpoints
2. **Services Layer:** `statnetService.ts`, `chlService.ts` fetch and cache data
3. **Translators:** Convert API responses to domain models (`statnetToDomain.ts`, `chlToDomain.ts`)
4. **API Routes:** Next.js API routes expose data with caching
5. **Pages:** Server components fetch data and render UI
6. **Components:** Reusable UI components display data

### Caching Strategy
- Node.js `Map`-based in-memory cache (`src/app/utils/cache.ts`)
- TTL-based expiration (5 minutes for games, 15 minutes for standings/stats)
- Cache inspection/clearing endpoints at `/api/cache/inspect` and `/api/cache/clear`

## Key Features

### Leagues Supported
- **SHL** (Swedish Hockey League) - Men's top division
- **SDHL** (Swedish Women's Hockey League) - Women's top division
- **CHL** (Champions Hockey League) - European club competition

### Core Functionality
1. **Game Schedules**
   - Live game status
   - Previous and upcoming games
   - Game statistics and scores

2. **League Standings**
   - Full standings tables with sorting
   - Compact standings view
   - Win/loss trend indicators
   - Head-to-head statistics

3. **Team Pages**
   - Team-specific game history
   - Next game countdown
   - Head-to-head records against opponents
   - Trend visualization (5-game form)

4. **Player Statistics**
   - Top scorers (goals, assists, points)
   - Top goalies (save percentage, GAA)
   - Filterable by league

## Code Conventions

### Component Patterns
- **Server Components by default** - use `'use client'` only when needed
- **Component file structure:**
  ```typescript
  // Types/Interfaces first
  type Props = {...}

  // Component definition
  export default function Component({ props }: Props) {...}

  // Helper functions after
  function helper() {...}
  ```

### Naming Conventions
- **Components:** PascalCase (`GameContainer`, `LeagueHeader`)
- **Files:** kebab-case for utilities, camelCase for services
- **Types:** PascalCase interfaces/types (`DomainGame`, `StandingsEntry`)

### Styling
- **Tailwind CSS** utility-first approach
- **Responsive design:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dark backgrounds** with light text (league-specific color schemes)
- **League colors:**
  - SHL: Dark theme with gold accents
  - SDHL: Dark theme with teal accents
  - CHL: Dark theme with blue accents

### State Management
- **Server-side data fetching** with Next.js App Router
- **Client state:** React `useState`, `useEffect` for interactive components
- **No global state library** - props and server components handle most state

## Development Workflow

### Commands
```bash
yarn dev             # Start dev server with Turbopack
yarn build           # Production build
yarn start           # Start production server
yarn lint            # Run Biome linter
yarn lint:fix        # Auto-fix linting issues
yarn eslint          # Run ESLint
yarn eslint:fix      # Auto-fix ESLint issues
```

### Development Guidelines
1. **Always read existing code first** before making changes
2. **Prefer editing** over creating new files
3. **Maintain accessibility** - see accessibility audit document
4. **Use TypeScript strictly** - no `any` types
5. **Follow existing patterns** for consistency

## Current Focus Areas

### Accessibility Improvements (WCAG 2.1 AA)
See [Accessibility audit and remediation plan for Gameday frontend.md](fleet-file://457lfg144gufl893nokm/Users/andreas/workspace/oh77/gameday/Accessibility%20audit%20and%20remediation%20plan%20for%20Gameday%20frontend.md?type=file&root=%252F) for detailed plan.

**High Priority:**
1. Consistent `<main>` landmarks on all pages
2. Decorative background images with `alt=""` and `aria-hidden`
3. Color-only indicators need text alternatives (trend markers)
4. Tabs component needs proper ARIA semantics
5. Icon-only links need accessible labels

**Medium Priority:**
- Data tables need `<caption>` elements
- Loading/error states need better screen reader support
- Tooltips need programmatic alternatives

### Recent Changes
- Added accessibility elements (recent commit: e8c779e)
- Added longest streaks feature (commit: bd5255e)
- Added largest win tables (commit: 3ad6fc4)
- Fixed package upgrades for react2shell-next bug (commit: fef084a)

## Testing & Quality

### Current Setup
- **ESLint** with Next.js configuration
- **Biome** for fast linting and formatting
- **Type checking** via TypeScript compiler

### Recommended Additions
1. **eslint-plugin-jsx-a11y** for accessibility linting
2. **jest-axe** or **vitest-axe** for component accessibility testing
3. **Lighthouse CI** for automated accessibility audits

## API Integration

### Statnet API (SHL/SDHL)
- Base URL: `https://api.statsnet.io`
- Endpoints: games, standings, player stats, goalie stats
- Response format: JSON
- Translator: `statnetToDomain.ts`

### CHL API
- Multiple data sources for teams, games, standings
- Response format: JSON
- Translator: `chlToDomain.ts`

### Data Refresh Rates
- **Games:** 5-minute cache TTL
- **Standings:** 15-minute cache TTL
- **Player Stats:** 15-minute cache TTL

## Common Tasks

### Adding a New League
1. Create service in `src/app/services/[league]Service.ts`
2. Define types in `src/app/types/[league]/`
3. Create translator in `src/app/utils/translators/[league]ToDomain.ts`
4. Add API routes in `src/app/api/[league]-*/`
5. Create pages in `src/app/[league]/`
6. Add league-specific components if needed

### Adding a New Component
1. Create in `src/app/components/[component-name]/`
2. Use `index.tsx` as main file
3. Export default component
4. Follow existing styling patterns
5. Ensure accessibility (semantic HTML, ARIA when needed)

### Debugging Cache Issues
- Visit `/cache` to inspect cache contents
- Visit `/cache/clear` to clear cache (development only)
- Check `src/app/utils/cache.ts` for TTL settings

## Performance Considerations
- **Image optimization:** Use Next.js `Image` component
- **Code splitting:** Automatic with Next.js App Router
- **Caching:** In-memory cache reduces API calls
- **Turbopack:** Fast development builds
- **Static generation:** Consider for standings pages

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Accessibility: Screen readers, keyboard navigation

## Environment & Deployment
- **Platform:** Vercel (inferred from analytics integration)
- **Node version:** 20+ (inferred from dependencies)
- **Environment variables:** None currently defined in repo

## Known Issues & TODOs
- Accessibility audit remediation in progress
- See git status for untracked accessibility audit document
- Consider adding environment-based feature flags
- Consider adding automated testing

## Contact & Resources
- **Repository:** (Add GitHub URL if applicable)
- **Documentation:** This file + inline code comments
- **Accessibility Audit:** See separate markdown file in root

---

**Last Updated:** 2026-01-14
**Maintainer:** Andreas (inferred from workspace path)
