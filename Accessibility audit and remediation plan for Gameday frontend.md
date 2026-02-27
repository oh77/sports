# Accessibility audit and remediation plan for Gameday frontend
## Problem statement
The Gameday frontend (Next.js App Router + React + Tailwind) should be usable with screen readers, keyboard-only navigation, and users with low vision or color-vision deficiencies. The goal is to identify concrete accessibility issues in the current implementation and define a prioritized plan to reach at least WCAG 2.1 AA for core user flows (home, league overview pages, team pages, standings and match lists).
## Current state (high-level)
* Uses semantic elements in many places (e.g. `<main>` on several pages, `<table>` for standings) and provides alt text for most images.
* Root layout sets `lang="sv"` appropriately (`src/app/layout.tsx:28`).
* Interactive elements are generally implemented with native controls (`button`, `Link`) rather than generic `div`s.
* Some patterns (background imagery, custom tabs, colored markers, icon-only controls) are not yet fully accessible.
## High-priority issues (address first)
### 1. Inconsistent main landmarks and page structure
**Impact:** Screen reader users depend on landmarks and headings to understand page structure and jump between regions. Missing or inconsistent `<main>` makes navigation harder.
**Findings**
* `src/app/chl/page.tsx:128-151` renders top-level layouts with `<div className="min-h-screen ...">` for loading, error, and main content instead of `<main>`.
**Actions**
* Refactor `CHLPage` so all primary views (loading, error, and success) render their content inside a `<main className="min-h-screen ..." role="main">` element, similar to SHL/SDHL pages.
* Ensure each route has exactly one `<main>` landmark and that the first substantial heading inside it is an `h1` describing the page.
### 2. Decorative background images exposed to screen readers
**Impact:** Large, low-opacity background logos are purely decorative but currently announced as meaningful images, increasing noise for screen reader users.
**Findings (examples)**
* SHL page background logo(s):
    * Loading and error states: `src/app/shl/page.tsx (185-195, 224-234)` – `alt="SHL Background"`.
    * Main state: `src/app/shl/page.tsx (264-275)` – same pattern.
* SDHL page background logo(s):
    * Loading, error, and main states: `src/app/sdhl/page.tsx (185-195, 224-234, 265-275)` – `alt="SDHL Background"`.
* CHL page background logo: `src/app/chl/page.tsx (155-163)` – `alt="CHL Background"`.
* Team page background logo: `src/app/shl/[teamCode]/page.tsx (130-140)` – `alt={`${teamInfo.short} Background`}` though it is purely decorative.
**Actions**
* For purely decorative imagery, change Next `Image` usage to:
    * `alt=""` (empty alt text), and
    * `aria-hidden={true}` and/or `role="presentation"`.
* Keep meaningful alt text only where the image conveys essential information not present in nearby text (e.g. team logo next to team name).
### 3. Color-only and tooltip-only indicators (trend markers and head-to-head)
**Impact:** Users with color-vision deficiencies or screen readers may not understand match results or trends when the only cue is dot color or a `title` tooltip, which is not reliably exposed to assistive tech.
**Findings**
* Trend markers:
    * `src/app/components/trend-markers/index.tsx (102-135)` uses small colored circles (`bg-green-500`, `bg-red-500`, etc.) to represent win/loss/OT, with only a `title` attribute and no visible legend or text alternative.
* Head-to-head circles:
    * `src/app/components/head-to-head/headToHeadCircle.tsx (14-21, 40-71)` rely on `title` attributes for details and color/shape for meaning; upcoming games show a date/time inside a circle but not explicitly labeled for screen readers.
**Actions**
* Add a concise, visible legend near `TrendMarkers` explaining colors (e.g. `Vinst`, `Vinst (OT)`, `Förlust`, `Förlust (OT)`) and ensure the mapping is not conveyed by color alone (e.g. use text abbreviations inside circles or additional icon shapes).
* For each marker, add a programmatic label, e.g.:
    * `aria-label` on the colored dot summarizing opponent, home/away, score and result.
    * Prefer `aria-label`/`aria-describedby` over `title` since `title` is inconsistently announced.
* For `HeadToHeadCircle`, ensure:
    * The winning-team logo images already include meaningful `alt` (they do) but confirm it summarizes winner and score.
    * For date/time circles, add `aria-label` (e.g. "Match {date} {time}") on the outer `div` instead of relying on `title` alone.
### 4. Tabs component lacks ARIA semantics and full keyboard behavior
**Impact:** Without `role="tablist"`, `role="tab"`, `aria-selected`, and arrow-key navigation, screen reader users can still click the buttons, but the structure is not announced as tabs and keyboard navigation is suboptimal.
**Findings**
* `src/app/components/tabs/index.tsx (77-107)` renders a row of `<button>` elements for tab headers but:
    * Lacks `role="tablist"` on the container and `role="tab"` on each tab.
    * Does not set `aria-selected`, `aria-controls`, or `id` pairings between tabs and their panels.
    * Does not implement left/right arrow key navigation as recommended in WAI-ARIA Authoring Practices.
**Actions**
* Update the tabs header container to `role="tablist"`.
* For each tab button:
    * Add `role="tab"`.
    * Provide a stable `id` (e.g. `${id}-tab`).
    * Add `aria-selected={activeTab === tab.id}` and `tabIndex={activeTab === tab.id ? 0 : -1}`.
    * Associate with its panel via `aria-controls`.
* Wrap `activeTabContent` in a `<div role="tabpanel" id="..." aria-labelledby="...">`.
* Optionally, handle left/right arrow keys on the tablist to move focus between tabs.
### 5. Icon-only links and league menu behavior
**Impact:** Icon-only links and menus can be ambiguous for screen reader and keyboard users if their accessible names and focus behaviors are not explicit.
**Findings**
* League standings icon link:
    * `src/app/components/league-header/index.tsx (109-135)` uses a circular link containing only an SVG icon with a `title` and `aria-label` on the `<svg>`, but the `Link` itself has only a `title` attribute.
* League logo menu:
    * `src/app/components/league-header/index.tsx (48-106)` uses a button to toggle a league switcher menu and a full-screen backdrop button to close it.
    * Menu structure is a `div` with `Link` children, but no explicit `role="menu"`/`role="menuitem"`, no focus move into the menu when opened, and no focus trap.
**Actions**
* Standings icon link:
    * Add an explicit accessible name on the `Link`, e.g. `aria-label="Visa ligatabell"`, and rely less on the SVG `title`.
* League menu:
    * On open, move focus from the toggle button into the menu (e.g. first link), and when closing, return focus to the toggle button.
    * Consider using `role="menu"` on the menu container and `role="menuitem"` on items, *or* model it as a simple navigation list with `nav` + list semantics.
    * Close the menu on `Escape` via a global key handler (instead of on the backdrop only) and ensure the backdrop button is not the only focusable element between toggle and menu items.
## Medium-priority issues
### 6. Data tables missing captions and extra context
**Impact:** Users of assistive technologies benefit from a short textual summary of a table’s purpose and clearer expansion of abbreviations like `M`, `V`, `O`, `F`, `P`.
**Findings**
* Full standings table: `src/app/components/standings/full-standings/index.tsx (45-233)` has a well-structured `<table>` but no `<caption>` and uses abbreviated column headers (`M`, `V`, `O`, `F`, `P`, `G`, `GA`, `GM`).
* Compact standings table: `src/app/components/standings/compact-standings/index.tsx (162-257)` has the same issues.
* Match summary tables: `src/app/components/standings/matches-table/index.tsx (136-295)` similarly lack captions.
**Actions**
* Add descriptive `<caption>` elements to each table (e.g. "Ligatabell för SHL" / "Ligatabell (kompakt)" / "Största hemmavinster").
* For abbreviated headers, either:
    * Use full Swedish text (e.g. `Matcher`, `Vinster`, `Oavgjorda`, `Förluster`, `Poäng`), or
    * Keep abbreviations visually but add screen-reader-only expansions:
        * Example: wrap the visible label in a `<span aria-hidden="true">M</span>` plus `<span className="sr-only">Matcher</span>`.
### 7. Loading and error states could be clearer for assistive tech
**Impact:** Skeleton UIs without textual cues can be confusing to non-visual users; they may perceive a blank page instead of “loading data”.
**Findings (examples)**
* SHL and SDHL loading states rely heavily on animated gray boxes (`src/app/shl/page.tsx:183-218`, `src/app/sdhl/page.tsx:183-218`) with no explicit "laddar" text.
* CHL loading state does include text ("Loading CHL games...") but uses a generic `div` instead of `<main>` and lacks `aria-busy`.
**Actions**
* For each route’s loading UI:
    * Include a visible text label like "Laddar matcher..." or "Laddar ligatabell...".
    * Add `aria-busy="true"` to the `<main>` element while data is loading, and remove it once loaded.
* For error states, ensure the main error message is an `h1` or prominent heading inside `<main>` so it is announced clearly.
### 8. Tooltips and hover-only information
**Impact:** Hover tooltips are not accessible on touch devices and are inconsistently announced by screen readers.
**Findings**
* LeagueFooter tooltips:
    * `src/app/components/league-footer/index.tsx (79-135)` show team names in a `div` that appears on hover (`group-hover:opacity-100`), but there is no guarantee this content is exposed to screen readers.
**Actions**
* Ensure the `Link` wrapping each logo already has accessible text equivalent to the tooltip (e.g. via its `aria-label` or link text). Currently the image `alt` uses the team name; this may be sufficient, but confirm via testing.
* If the tooltip adds extra context (e.g. league vs team), ensure that context is either in visible text or `aria-label`, not only in the hover-only bubble.
## Low-priority / enhancements
### 9. Add skip links and structural landmarks
**Impact:** Improves efficiency for keyboard and screen reader users, especially when navigating pages with many repeated elements.
**Actions**
* In `src/app/layout.tsx`, add a visually-hidden skip-link at the start of `<body>` pointing to `id="main-content"` on the main element of each page.
* Optionally wrap global navigation in `<header>` / `<nav>` and the footer in `<footer>` to give additional landmarks.
### 10. General consistency of headings and labels
**Impact:** Consistent use of headings and labels makes it easier to scan pages with assistive technologies.
**Actions**
* Verify each route has exactly one `h1` that matches the page purpose (e.g. league date heading, team name) and subsequent headings use descending order (`h2`, `h3`, ...).
* Ensure interactive labels are consistent and descriptive (e.g. error-page links like "Tillbaka till SHL" / "Tillbaka till Hem").
## Automation and tooling strategy
### 1. Linters and static analysis
* Extend ESLint configuration to include JSX a11y rules:
    * Install: `yarn add --dev eslint-plugin-jsx-a11y`.
    * In your ESLint config, add:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
```
* Run `yarn eslint` as part of local development and CI to catch missing alt text, mislabeled controls, misuse of ARIA, etc.
* Continue using `biome` for style/perf rules, but rely on ESLint + `eslint-plugin-jsx-a11y` for richer accessibility checks.
### 2. Browser and DevTools-based audits
* Integrate regular manual checks into your workflow:
    * Chrome Lighthouse accessibility audits on key routes (`/`, `/shl`, `/sdhl`, `/chl`, `/shl/[teamCode]`).
    * Use the "Accessibility" pane in Chrome/Edge DevTools to inspect the accessibility tree and computed names for controls.
    * Use an extension like Axe DevTools to run automated WCAG rule checks on each major screen.
### 3. Component-level automated a11y tests
* For critical interactive components (`Tabs`, `LeagueHeader`, `TrendMarkers`, standings tables):
    * Use `@testing-library/react` to render components.
    * Add `jest-axe` or `vitest-axe` to run `axe` against the rendered output and fail tests on accessibility violations.
* Focus tests on:
    * Tabs semantics and keyboard behavior.
    * League menu open/close, focus management and accessible names.
    * Standings tables (presence of captions, table headers, no obvious `axe` violations).
### 4. CI integration
* In your CI pipeline (e.g. GitHub Actions):
    * Add steps to run `yarn eslint` and your test suite (including `axe`-based tests) on each push/PR.
    * Optionally add a Lighthouse CI step for a small set of key routes to catch regressions in color contrast, headings, and landmark structure.
## Implementation order (summary)
1. Fix main landmarks and decorative images (Issues 1–2).
2. Improve color/tooltip indicators and tab semantics (Issues 3–4).
3. Tighten up icon-only links and menu behavior (Issue 5).
4. Enhance tables with captions/abbreviations and improve loading/error messaging (Issues 6–7).
5. Add skip links, refine tooltips/headings, and wire up automated checks (Issues 8–10 and Automation strategy).
