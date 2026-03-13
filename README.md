# Freeq Affiliate

Freeq Affiliate is a Next.js prototype for a creator affiliate marketplace. It models how brands and creators could browse programs, review commissions, handle commission reversals, and eventually coordinate payouts. The current repository is a front-end prototype only: it is rich in flows and mock data, but it does not yet include a backend, authentication, persistence, or payment execution.

For a deeper code map, see [`SOURCE_OVERVIEW.md`](./SOURCE_OVERVIEW.md).

## Current status

- Single-route prototype built for rapid design iteration
- Two persona experiences in one app: `brand` and `publisher` (the UI presents publisher as creator)
- Uses local mock data for commissions, commission reviews, programs, creators, and attribution details
- Includes Figma capture hooks and Vercel analytics
- No API routes, database, auth, or external integrations in the repo today

## Tech stack

- Next.js 16 with the App Router
- React 19
- TypeScript with strict mode enabled
- Tailwind CSS v4 via PostCSS
- Recharts for dashboard visualization
- Lucide icons
- Vercel Analytics
- npm with `package-lock.json`

## Getting started

### Prerequisites

- Node.js and npm compatible with the versions declared in [`package.json`](./package.json)

### Install and run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Notes

- The app only defines one page route, `/`. Different prototype screens are selected through query parameters instead of multiple filesystem routes.
- Fonts are loaded from the local `geist` package, so builds do not depend on fetching Google Fonts at build time.

## Useful URLs

- Brand default: `/`
- Creator default: `/?view=publisher`
- Brand commission detail: `/?view=brand&screen=detail&commission=COM-1017`
- Creator commission detail: `/?view=publisher&screen=detail&program=Chocolate%20Bar%20Drop%20Vol.%203&commission=COM-1017`
- Capture mode example: `/?capture=1&view=brand&screen=all-programs&capturePreset=desktop`

## Scripts

- `npm run dev`: start the local development server
- `npm run build`: produce the production build with Webpack
- `npm run start`: start the production server
- `npm run lint`: run the current TypeScript typecheck
- `npm run typecheck`: run the TypeScript typecheck directly

## Ubuntu / EC2 Notes

The same flow used locally should work on an Ubuntu EC2 instance:

```bash
npm install
npm run build
npm run start -- --hostname 0.0.0.0 --port 3000
```

Operational notes:

- Use the same major Node.js version you use locally to minimize drift.
- Open the instance security group for the port you actually serve, or put the app behind Nginx and only expose `80` and `443`.
- If you use a reverse proxy, keep the Node app bound to `127.0.0.1` instead of `0.0.0.0`.

## Deployment

The repo already contains a [`vercel.json`](./vercel.json) file:

- Framework: `nextjs`
- Build command: `npm run build`
- Output directory: `.next`

At the moment, deployment is straightforward because the app does not reference environment variables or server-side integrations.

Typical path to a shareable deployment:

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Import the repo into Vercel.
3. Let Vercel install dependencies and run `npm run build`.
4. Share the resulting Vercel URL.

## Repository layout

```text
app/
  globals.css              Global theme tokens and capture-mode layout styles
  layout.tsx               Fonts, metadata, analytics, Figma capture script
  page.tsx                 Client entry page that mounts the prototype shell

components/
  app-shell.tsx            Top-level view and query-param router
  brand/                   Brand-side screens and flow orchestration
  publisher/               Creator-side screens and flow orchestration
  capture/                 Figma capture helpers
  ui/                      Reusable UI primitives

lib/
  mock-data.ts             Main prototype dataset and formatting helpers
  verified-influence.ts    Derived attribution, audit, and timeline logic
  app-navigation.ts        Query-string deep-link generation
  capture-pipeline.ts      Capture-mode parsing and presets
  use-lazy-table.ts        IntersectionObserver-based pagination helper
  component-inventory.ts   Metadata for an unused component explorer
  utils.ts                 `cn()` class helper

public/assets/nav/
  brand/                   Brand SVG nav assets
  publisher/               Creator SVG nav assets
```

## Prototype boundaries

Based on the current repo contents:

- There is no backend application code.
- There are no `app/api` routes or server actions.
- There are no environment variables referenced via `process.env`.
- There is no auth provider, payment provider, or database client wired in yet.
- Browser history and query params are used as the stateful navigation layer.

Those are not problems for a clickable prototype, but they are the main areas that will need to be added before this becomes a production system.
