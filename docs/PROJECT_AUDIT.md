# Project Audit

Audit date: 2026-07-13

## Current Directory Tree

Tracked in GitHub `main`:

```text
LetsCollect/
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
├── hero-jelly-jade-toy.html
├── public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb
├── vercel.json
└── .env.example
```

The earlier local-only `index.html` gallery prototype has been removed.

## Current Page Entry

`vercel.json` rewrites `/` to `/hero-jelly-jade-toy.html`.

The direct page URL is:

`https://lets-collect.vercel.app/hero-jelly-jade-toy.html`

## Current Technology Stack

- HTML/CSS/vanilla JavaScript in one page.
- Three.js `0.165.0` loaded from CDN.
- `GLTFLoader` for GLB model loading.
- `DRACOLoader` with decoder loaded from jsDelivr.
- `RoomEnvironment` for environment reflections.
- Vercel static hosting.

## Current 3D Loading

`hero-jelly-jade-toy.html` creates a WebGL renderer, scene, camera, lights, material variants, and drag-to-inspect loop inline.

Model load path:

```js
gltfLoader.load("public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb", ...)
```

Current GLB file:

`public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb`

Current size:

About 2.35 MB.

## Current Reusable Code

Reusable ideas exist, but not yet reusable modules:

- Quality settings: `high`, `medium`, `low`.
- Jade material variant data.
- Model centering and scaling logic.
- Loading progress handling.
- Pointer drag inspect logic.
- Responsive canvas resize logic.

## Current Duplicated Or Page-Bound Logic

These are embedded directly in the page and should later move into modules:

- Three.js renderer lifecycle.
- GLB loading and Draco configuration.
- Material creation and variant transitions.
- Lighting setup.
- Pointer interaction.
- Animation loop and idle frame throttling.
- Metadata rendering.
- Product data.
- CSS tokens and component styles.

## Current Risks

- One large HTML file owns layout, data, style, 3D, and interaction.
- No disposable ThreeViewer abstraction yet.
- No routing or product data layer.
- No test harness.
- CDN dependency means first load depends on external availability.
- Draco decoder is fetched externally.
- No WebGL fallback yet.
- Animation loop continues for the page lifetime.
- No page visibility pause.
- Model filename is not descriptive or versioned.
- Asset paths are still referenced directly by the page until config extraction.

## Current Performance Issues

- Three.js and decoder are loaded from CDN on first visit.
- GLB is optimized but still large for mobile first paint.
- No poster image placeholder.
- No preview/mobile model variant.
- No lazy loading by viewport.
- Environment setup and shader compilation still happen on page load.

## Missing Config And Docs Before This Pass

- No architecture docs.
- No start-here docs.
- No data model docs.
- No model pipeline docs.
- No `.env.example`.
- No clear directory plan.
- README was too brief for handoff.

## Preserve

- Working `hero-jelly-jade-toy.html` visual behavior.
- Existing deployed path behavior.
- Current GLB until an asset migration is tested.
- Vercel root rewrite.
- GLB cache headers.

## Refactor Later

- Extract ThreeViewer.
- Centralize model asset paths in `src/config/` or `src/data/`.
- Move CSS tokens into `src/styles/`.
- Move variant and toy metadata into `src/data/`.
- Add app shell and route registry.
- Add service boundaries for auth, toys, collections, and draw.

## Temporarily Leave Alone

- Framework choice.
- Supabase runtime integration.
- Auth.
- Collection persistence.
- Draw mechanics.
- Admin pages.
- Framework migration.
