# Changelog

## 2026-07-30

- Retired the localized plush prototype after review: approved recolor targets
  span food, clothing, and accessories, so neither plush nor Jelly Jade is
  retained as a universal surface.
- Kept matte resin and metal as the two active Lab surface families; metal
  continues to expose gold, silver, and rose gold.
- Added four independent stage backgrounds to Appearance Lab: animated
  `初冬` (pale blue with snow), animated `暖春` (pale green with leaves),
  and static pale green and pale lavender.
- Limited animated particles to the single live 3D inspector. The twenty-four
  thumbnails inherit the selected static base color without creating extra
  animation or WebGL work.
- Updated the Lab summary to 1,152 surface, color, model, and background
  combinations.
- Added the Asset Registry V1 contract shell: typed snapshot records, runtime
  validation, stable getters, presentation and asset-path resolvers, plus a
  validation CLI. No production data source has been switched yet.

## 2026-07-29

- Moved all six Jelly Jade runtime groups and both Diamond runtime groups out of
  `public/models/toys/` into local-only archive folders; the public runtime tree
  now contains exactly the twenty-four formal Color Animals.
- Removed retired Jelly Jade/Diamond IDs, palettes, generator branches, stored
  compatibility, preload paths, Diamond backdrops/materials, and the old
  Material/Diamond Labs from the active application.
- Added verified byte-size/SHA-256 manifests for all eight offline runtime
  archives and documented the explicit restoration boundary.
- Moved the five retired Jelly Jade source GLBs from the canonical active
  source area into local-only archive folders, preserving byte sizes and
  SHA-256 identities in tracked manifests.

- Removed the retired `legacy/hero-prototype/` HTML and GLB from the working
  tree after the React replacement, retaining Git commit `d34f28c` as the
  documented historical recovery point.
- Updated current architecture, product, development, roadmap, and handoff
  documents so they no longer describe the retired Hero as a live rollback
  directory.

- Replaced the retired full-body Color Bird with the v002 crown-only model.
- Promoted Color Penguin v003 into the formal twenty-four-model roster and the
  Monochrome series.
- Retired Color Teddy completely from catalog, draw, runtime, Labs, mock data,
  and production rendering.
- Made archived model payloads local-only and Git-ignored while preserving
  concise archive manifests.
- Synchronized the TypeScript capability registry with all twenty-four active
  models.
- Added a canonical formal-roster contract shared by the catalog, draw series,
  and capability registry.
- Added the development-only `/appearance-lab/` HTML with a 24-by-9 matte
  comparison matrix, palette and model filters, and one live 3D inspector.
- Defaulted the Lab to one color across all twenty-four models so every model
  enters the thumbnail queue before the optional full-color matrix.
- Removed the duplicate multi-canvas Asset Lab and excluded Appearance Lab
  routes, chunks, and styles from the production SPA build.
- Centralized collectible-specific model preparation across `ToyViewer`,
  `SeriesToyViewer`, and `ThumbnailRenderer`.
- Added an optional surface-style layer with a matte-compatible default and a
  localized gold, silver, and rose-gold treatments for all twenty-four active models.
- Expanded Appearance Lab with matte and three-metal controls, surface-aware
  cache identities, and a 288-combination summary without adding the Lab to
  the production SPA bundle.

## 2026-07-28

- Synchronized the current project documentation with the active
  `codex/companion-echo-frontend` branch.
- Recorded twenty-four active matte models, nine regular colorways, thirteen
  special series, and the archived crystal compatibility boundary.
- Marked the local Collect / Collection / Echo loop and Agent Console demo as
  implemented while keeping server authority and production multi-user behavior
  explicitly pending.
- Corrected the series shelf budget from the earlier six-context snapshot to a
  fourteen-series maximum after all lazy cards have been visited; per-model
  canvases remain prohibited.
- Documented current gaps: Collection filtering and Representative ordering,
  incomplete campaign lifecycle, the twelve-vs-twenty-four TypeScript capability
  registry mismatch, missing lint/tests, and mobile WebGL hardening.
- Confirmed that `main` / Vercel Production have not been replaced by the
  current development branch.

## 2026-07-17

- Replaced diamond with higher-transparency crystal, introduced colorless glass after plastic, and preserved the calibrated material-tier distribution.
- Promoted the eight-material study into generation V2 for new local Mock draws.
- Added material-weighted value ranges plus a five-trait craft vector while preserving the existing rarity economy.
- Calibrated 100,000 deterministic draws to 54.28% common, 27.66% rare, 11.05% epic, 6.01% legendary, and 1.00% mythic.
- Preserved stored V1 jelly-jade collectibles through a compatibility normalizer without changing their identity or appearance signature.
- Unified live 3D and thumbnail rendering behind `createToyMaterial`, retained mobile environment reflection for V2, and bumped thumbnail rendering to V3.
- Corrected glass and crystal exposure so refractive collectibles remain legible against light mobile stages and thumbnails.
- Replaced the local legacy collection with a deterministic 48-piece V2 material showcase and a compact four-column mobile gallery.
- Corrected `pnpm run typecheck` so it checks `tsconfig.app.json` instead of returning a false positive on the solution config.
- Added an unlisted `/material-lab` visual study comparing plastic, glass, wood, iron, copper, silver, gold, and crystal in one WebGL context.
- Kept the V1 jelly-jade generator, draw probabilities, persisted collectibles, and thumbnail cache contract unchanged.
- Documented the Material System V2 validation, migration, asset, and rollback boundaries in `playbooks/material-system-v2.md`.
- Confirmed `main` is the current React + Vite + TypeScript MVP and is aligned with `origin/main`.
- Confirmed GitHub remote is `https://github.com/leoleeloo-123/LetsCollect.git`.
- Updated product overview wording so it no longer describes the legacy static hero as the current production entry.
- Marked the July 13 project audit as a historical baseline to avoid confusing it with the current React app state.

## 2026-07-13

- Created `feature/react-product-shell` branch for React + Vite + TypeScript work.
- Added mobile-first React product shell with routes, navigation, mock toy data, and 3D viewer placeholder.
- Copied the existing hero prototype and GLB into `legacy/hero-prototype/` for reference.
- Verified React routes locally with typecheck, production build, and browser smoke checks.
- Production Vercel routing is intentionally unchanged.
- Removed the obsolete local legacy `index.html`.
- Moved the hero GLB into `public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb`.
- Updated the hero page and docs to use the organized model path.
- Added project handoff and architecture documentation.
- Added `.env.example`.
- Documented current static deployment, GLB loading, risks, and migration plan.
- The route and visual behavior are intended to stay the same; only the GLB asset path changed.

## Earlier

- Added root Vercel rewrite from `/` to `/hero-jelly-jade-toy.html`.
- Replaced earlier metaball bear prototype with GLB-based pink jelly bear.
- Optimized GLB for mobile and added long-lived GLB cache headers.
