# Start Here

## What This Project Is

Let's Collect is a 3D collectible toy platform concept. The product direction is digital collectible toys, toy series, 3D inspection, collection progress, and future draw or blind-box flows.

## Current State

The current production entry is still the static legacy hero prototype. A new React + Vite + TypeScript product shell now exists locally on the `feature/react-product-shell` branch, but it has not replaced production routing.

Local project path:

`C:\Users\licunhongyu\Desktop\LetsCollect`

GitHub repository:

`https://github.com/leoleeloo-123/LetsCollect`

Production site:

`https://lets-collect.vercel.app/`

## Current Entry

Vercel serves `/` through `vercel.json`, which rewrites to:

`/hero-jelly-jade-toy.html`

The hero page loads:

`/public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb`

## Current Technology

- Production legacy page: static HTML, CSS, vanilla JavaScript, and Three.js from CDN import maps.
- New product shell: React, Vite, TypeScript, and React Router.
- Vercel static hosting.
- The React shell has a Vite build, but production is not switched to it yet.
- No backend yet.
- No Supabase runtime code yet.

## Important Files

- `hero-jelly-jade-toy.html`: current working 3D hero prototype.
- `legacy/hero-prototype/`: copied legacy prototype and GLB reference.
- `src/`: React product shell source.
- `index.html`: Vite development entry for the React shell.
- `package.json`: React/Vite scripts and dependencies.
- `public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb`: optimized GLB model used by the hero page.
- `vercel.json`: root rewrite and GLB cache headers.
- `.gitignore`: local artifacts and uncompressed model exclusions.
- `docs/`: project management, architecture, and migration documentation.
- `AGENTS.md`: instructions for future Codex/agent work.

## Legacy File Cleanup

The earlier local `index.html` gallery prototype was deleted on 2026-07-13 after the user confirmed it was no longer needed.

## Current Priorities

1. Keep the deployed hero page stable until an explicit Vercel switch.
2. Validate the React product shell locally.
3. Build mobile-first page and component boundaries.
4. Extract a reusable ToyViewer in Phase 2.
5. Move verified 3D capability from legacy into ToyViewer after the shell is stable.

## Already Working

- Vercel root URL loads successfully.
- GLB path is deployed and cacheable.
- Hero model loads with Draco support.
- Drag-to-inspect interaction works in the current page.
- Material variants are controlled through in-page configuration.
- React shell routes exist for Home, Explore, Draw, Collection, Profile, Login, and Register.
- React shell has mobile bottom navigation and desktop top navigation.
- React shell uses mock toy data and a 3D viewer placeholder.

## Mock Or Not Implemented

- User accounts.
- Collections.
- Draw/gacha.
- Toy database.
- Admin tooling.
- Supabase integration.
- Router and multi-page app shell.

## Read Before Editing

Read these before significant work:

- `docs/PROJECT_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/DIRECTORY_STRUCTURE.md`
- `docs/THREE_MODEL_GUIDE.md`
- `docs/ROADMAP.md`
