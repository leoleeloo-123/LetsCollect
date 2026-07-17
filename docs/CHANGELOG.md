# Changelog

## 2026-07-17

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
