# Source Overview

This document is an engineer-facing map of the current codebase. It is meant to help a new human or coding agent understand how the prototype is structured, what is real, what is mocked, and where to start making changes.

## 1. High-level summary

This repository is a front-end-only prototype for a creator affiliate marketplace.

- It is built as a single Next.js App Router page.
- The app simulates two experiences:
  - `brand`
  - `publisher` (the UI language often treats this as creator)
- Nearly all product behavior is driven by in-memory mock data from `lib/mock-data.ts`.
- Navigation is handled client-side with React state plus `window.history.pushState` and query params.
- The prototype includes design-iteration helpers for pushing screens back into Figma.

What is not present in the repository today:

- Backend APIs
- Database access
- Authentication
- Real payout logic
- External brand/creator integrations
- Test suite or CI configuration

That is an observation from the current source tree and a repository-wide text scan, not a product claim.

## 2. Frameworks and tooling

### Runtime and framework

- Next.js 16 (`next`)
- React 19 (`react`, `react-dom`)
- TypeScript in strict mode

### Styling

- Tailwind CSS v4 through CSS-first configuration
- PostCSS plugin: `@tailwindcss/postcss`
- No `tailwind.config.*` file is present; theme tokens live in `app/globals.css`
- Fonts are loaded with `next/font/google`:
  - `Jost`
  - `Geist Mono`

### UI and visualization

- `lucide-react` for icons
- `recharts` for charts in the earnings dashboard
- `class-variance-authority`, `clsx`, and `tailwind-merge` for UI variants and class composition

### Deployment and analytics

- Vercel Analytics via `@vercel/analytics/react`
- Vercel deployment config in `vercel.json`

### Package management

- npm is the intended package manager
- `package-lock.json` is committed

## 3. How the app boots

### `app/layout.tsx`

The root layout sets the global page metadata, loads fonts, injects the Figma HTML-to-design capture script, and mounts Vercel Analytics.

### `app/page.tsx`

The only route in the app is `/`. The page is a client component that waits until mount before rendering `AppShell`. That mount gate avoids mismatches because the shell depends on `window.location`, browser history, and capture-query parsing.

### `components/app-shell.tsx`

`AppShell` is the real application entry point. It:

- Reads query params from `window.location.search`
- Resolves the active persona with `view` or `captureView`
- Resolves the current screen within that persona
- Resolves capture mode settings
- Chooses between `BrandShell` and `PublisherShell`

This file is the top-level router, but it is not using Next.js file-system routing for internal screens.

## 4. Navigation model

The prototype acts like a single-page state machine rather than a multi-route web app.

### Query params that matter

- `view`: `brand` or `publisher`
- `screen`: current screen key
- `program`: active program
- `commission`: active commission id
- `creator`: active creator
- `businessUnit`: active business unit
- `capture`: enables fixed-width capture mode
- `capturePreset`: one of the named breakpoint presets

### Navigation helpers

`lib/app-navigation.ts` centralizes URL generation. Both persona shells use it to keep the browser URL in sync with the selected screen. They rely on:

- `pushState` when moving forward through the prototype
- `replaceState` while preparing transitions or syncing initial state

### Capture mode

`lib/capture-pipeline.ts` defines:

- Allowed screens for each persona
- Breakpoint presets:
  - desktop
  - laptop
  - tablet
  - mobile
- Helpers for converting query params into a `CaptureModeConfig`

`components/capture/capture-mode-wrapper.tsx` applies a constrained stage width and min height when capture mode is on.

## 5. Main UI structure

### Brand side

Brand flows live under `components/brand/`.

The main shell is `components/brand/brand-shell.tsx`. It manages:

- Screen transitions
- URL synchronization
- Active program, creator, commission, and business unit selection
- Local draft state for newly created programs
- Content fade transitions
- Scroll restoration per screen

Brand screens currently include:

- All programs
- Program detail
- Commission queue
- Commission detail
- Disputes
- Publishers list
- Business units
- Create program
- Creator detail

### Creator side

Creator flows live under `components/publisher/`.

The main shell is `components/publisher/publisher-shell.tsx`. It manages:

- Screen transitions
- URL synchronization
- Active program and commission selection
- Program rail expansion
- Content fade transitions
- Scroll restoration per screen

Publisher screens currently include:

- Earnings dashboard
- Commission detail
- Dispute wizard
- Dispute tracking
- My programs
- Discover programs
- Program detail
- Program join confirmation
- Enrolled program detail

### Shared components

Shared workflow components live at the top of `components/`, for example:

- `commission-status-chip.tsx`
- `commission-attribution-panel.tsx`
- `commission-audit-log-dialog.tsx`
- `program-card.tsx`
- `view-switcher.tsx`

These are reused across both personas.

### UI primitives

`components/ui/` contains local primitives for:

- Buttons
- Badges
- Cards
- Dialogs
- Inputs
- Labels
- Tables
- Tabs
- Textareas

These are local source files, not imports from an external component registry.

## 6. Data model and derived logic

### `lib/mock-data.ts`

This is the largest and most important data file in the prototype. It contains:

- Core types such as `Commission`, `Dispute`, `BrandEntity`, and `BusinessUnit`
- Demo constants such as `DEMO_SHARED_PROGRAM_NAME` and `DEMO_SHARED_COMMISSION_ID`
- Synthetic and hand-authored commission data
- Dispute data
- Brand, business unit, creator, customer, and program datasets
- Formatting helpers and derived access helpers

This file is effectively standing in for a backend plus seed data.

Important exports include:

- `COMMISSIONS`
- `DETAIL_COMMISSIONS`
- `DISPUTES`
- `BRAND_PROGRAMS_DATA`
- `BUSINESS_UNITS`
- `CREATOR_PROFILES`
- `CUSTOMER_PROFILES`
- `ENROLLED_PROGRAMS`

### `lib/verified-influence.ts`

This file builds derived attribution and audit views on top of `mock-data.ts`. It powers the more "explainable" detail panels in the prototype, including:

- Attribution state
- Evidence signals
- Audit log entries
- Timeline events
- Reversal reason labeling
- Validation-day calculations

If someone asks where the "trust", "verification", or "why was this reversed?" UX is computed, this is the file to read.

### `lib/use-lazy-table.ts`

This is a small client hook that incrementally reveals rows using an `IntersectionObserver`. It is used for long data tables instead of full virtualization.

## 7. Styling system

The global visual language is centralized in `app/globals.css`.

Key details:

- Tailwind v4 is imported with `@import "tailwindcss";`
- Theme tokens are defined as CSS variables on `:root`
- Status colors for commission states are explicitly tokenized
- Capture mode layout classes are defined here
- Body typography uses the `Jost` font variable

There is also a partial dark theme token block, but the app appears designed primarily around the light theme.

## 8. Figma integration

This repo includes explicit Figma capture support.

### Where it lives

- `app/layout.tsx` loads `https://mcp.figma.com/mcp/html-to-design/capture.js`
- `components/capture/figma-capture-button.tsx` pushes the current screen into Figma if the capture runtime is available
- `components/capture/capture-mode-wrapper.tsx` constrains the layout for screenshot/design capture
- `lib/capture-pipeline.ts` defines capture presets and capture-aware routing

### Why it matters

This is not typical application code. It exists because the prototype was iterated in a Vercel/Figma/Codex loop. If you are trying to productionize the app, this layer should be treated as optional tooling rather than core business logic.

## 9. Deployment shape

Deployment is currently set up for Vercel.

`vercel.json` declares:

- `framework: "nextjs"`
- `buildCommand: "npm run build"`
- `outputDirectory: ".next"`

There are no environment variables referenced in the codebase right now, so deployment is relatively simple.

The practical blocker in this checkout is more basic: dependencies are not installed locally. When I ran:

- `npm run build`
- `npm run lint`

both failed because the `next` binary is not present until `npm install` has been run.

## 10. Notable implementation details

### Single-route architecture

This is a one-route prototype. There is no multi-page information architecture yet. That makes it fast to demo, but it also means:

- Screen state is manual
- Deep links are query-string based
- There is no route-level data loading
- There is no route-level access control

### Mostly client-driven behavior

Almost all interesting behavior is in client components. That is expected for a prototype, but it means the current code is optimized for demo flexibility over server/client separation.

### Unused or staging files

`components/component-explorer.tsx` and `lib/component-inventory.ts` describe a component explorer workspace, but they are not wired into the active route tree at the moment. They appear to be a utility surface left from the design/build process.

## 11. What an engineer should do first

If you are new to the repo, the fastest way to understand it is:

1. Read `package.json`, `app/layout.tsx`, `app/page.tsx`, and `components/app-shell.tsx`.
2. Read both persona shells:
   - `components/brand/brand-shell.tsx`
   - `components/publisher/publisher-shell.tsx`
3. Read `lib/mock-data.ts` and `lib/verified-influence.ts`.
4. Check `vercel.json` and `app/globals.css`.

That path explains almost everything about how the prototype behaves today.

## 12. Suggested next cleanup steps

If the goal is to move from prototype toward a shareable product shell, the highest-value follow-up work is likely:

1. Install dependencies and verify `dev`, `build`, and `lint`.
2. Separate demo data from UI concerns so the mock layer is easier to replace.
3. Introduce real route structure instead of routing only through query params.
4. Decide whether the Figma capture code stays in mainline app code or moves behind a dev-only flag.
5. Add a minimal backend plan for auth, programs, commissions, disputes, and payouts.

Until then, treat this repository as a polished interactive prototype, not an application with production plumbing.
