# Start Here

## What This Project Is

Let's Collect is a 3D collectible toy platform concept. The product direction is digital collectible toys, toy series, 3D inspection, collection progress, and future draw or blind-box flows.

## Current State

The current deployable product is still a static prototype. It has one working hero page that loads a compressed GLB model through Three.js and lets users inspect a pink jelly bear.

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

- Static HTML, CSS, and vanilla JavaScript.
- Three.js from CDN import maps.
- `GLTFLoader`, `DRACOLoader`, and `RoomEnvironment`.
- Vercel static hosting.
- No build tool yet.
- No backend yet.
- No Supabase runtime code yet.

## Important Files

- `hero-jelly-jade-toy.html`: current working 3D hero prototype.
- `public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb`: optimized GLB model used by the hero page.
- `vercel.json`: root rewrite and GLB cache headers.
- `.gitignore`: local artifacts and uncompressed model exclusions.
- `docs/`: project management, architecture, and migration documentation.
- `AGENTS.md`: instructions for future Codex/agent work.

## Legacy File Cleanup

The earlier local `index.html` gallery prototype was deleted on 2026-07-13 after the user confirmed it was no longer needed.

## Current Priorities

1. Keep the deployed hero page stable.
2. Document current architecture and product direction.
3. Move toward a modular vanilla JS structure.
4. Extract a reusable ThreeViewer without changing the existing visual result.
5. Add product data, routes, and mock pages only after the viewer boundary is clear.

## Already Working

- Vercel root URL loads successfully.
- GLB path is deployed and cacheable.
- Hero model loads with Draco support.
- Drag-to-inspect interaction works in the current page.
- Material variants are controlled through in-page configuration.

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
