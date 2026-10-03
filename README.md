# HMH ILA Minerals — Cooperative Export Platform

Cooperative export platform prepared by ILA South Africa with HMH Group, for discussion with the
North West Provincial Government: small-scale miners join a registered cooperative which aggregates,
grades and sells through one compliant channel — to local smelters and refiners first, and to verified
importers — with royalties captured and miners paid on proof of sale.

All "live" activity (market ticker, audit ledger, payment volume, instrument stages) is simulated in the
browser. There is no backend, database or external API.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS 4 plus a ported design system in `app/globals.css` (CSS variables, light/dark themes)
- Fonts via `next/font`: Bricolage Grotesque (headings), Public Sans (body)
- Charts are hand-built SVG components

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — `/` redirects to `/gov` (Government dashboard).

Useful checks:

```bash
npm run build   # production build
npm run lint    # eslint (next/core-web-vitals + typescript)
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework preset: **Next.js** (auto-detected). Keep the defaults — no env vars, no extra config.
4. Deploy.

## Project structure

```
app/
  layout.tsx                 root layout: fonts, theme boot script, viewport
  globals.css                design system: palettes, components, responsive rules
  page.tsx                   / -> redirect to the default module (/gov)
  not-found.tsx              custom 404
  icon.svg                   favicon
  [module]/
    layout.tsx               mounts PlatformShell
    page.tsx                 renders the module component (static params)
components/
  Shell.tsx                  platform shell: sidebar rail, drawer, top bar, ticker, toast
  SimContext.tsx             shared simulation context (2s tick, ledger queue, actions)
  Ticker.tsx                 simulated market ticker
  Toast.tsx                  toast() helper + host
  ThemeButton.tsx            light/dark switch persisted to localStorage
  ui.tsx                     Stat, Panel, Pill, Flag, Bar, ViewHead, ...
  charts.tsx                 SVG charts: LiveLine, Spark, TwoLine, MonthBars, BarRows,
                             DistrictMap, Timeline, CameraGrid, FunnelRows, Steps
  modules/
    shared.tsx               Gov dashboard, Bank dashboard, Vetting, ESG, Market, Gateway
    minerals.tsx             Minerals modules (overview, coop, permit, assay, chain,
                             trade, funds & royalties, prices & risk, site security)
    index.ts                 module id -> component map
data/
  types.ts                   PlatformCfg (typed equivalent of window.ILA_CFG)
  minerals.ts                Minerals platform config: modules, districts, parties, instruments, ...
  index.ts                   exports CFG
lib/
  sim.ts                     seeded initial state, tick logic, SHA-256 hash chain, formatters
  actions.ts                 user actions: register, match, trace, pay, score, ledger
```

## Notes

- Module routes are shareable (`/finance`, `/chain`, `/trade`, ...) and the browser back button works.
- The sidebar becomes a slide-in drawer below 1024px; tables scroll inside their own containers; content
  is capped at ~1600px and centered on very large screens.
- Theme follows the system preference; the manual switch persists to `localStorage` and is applied before
  first paint to avoid a flash.
- `prefers-reduced-motion` disables animations.
