# Three Model Guide

## Current Model Pool

The active mobile-first matte pool contains Color Otter, Color Bird, Color Teddy,
Color Bunny, Color Cat, Color Panda, Color Bear Singer, Color Dog Camera,
Color Dog Drum, and Color Seal. The crystal pool contains Diamond Unicorn and
Diamond Dog. Runtime GLBs and their protection masks live under
`public/models/toys/{toy-slug}/`.

Original high-resolution GLBs for active models live under `assets/models/source/{toy-slug}/` and are never requested by the browser. Superseded experiments, retired model families, rebuild history, and rollback code belong under `assets/models/archive/{toy-slug}/`. Color Unicorn and the retired Color Cat v001 remain archived; the earlier Unicorn, Kitty, Bunny, Bird, Doggy, and Karpy crystal pool remains a separate rollback path.

All runtime paths, protection masks, framing overrides, and recoloring modes are registered in:

`src/features/toys/catalog.ts`

## Current Loader

The shared `ToyViewer` uses:

- Three.js `0.165.0`
- `GLTFLoader`
- `DRACOLoader`
- locally deployed Draco decoder files
- versioned `MeshPhysicalMaterial` creation through `createToyMaterial`

## Naming Direction

GLB names must be descriptive and versioned:

```text
public/models/toys/{toy-slug}/model-desktop-v001.glb
public/models/toys/{toy-slug}/model-mobile-v001.glb
public/models/toys/{toy-slug}/model-preview-v001.glb
```

Example:

```text
public/models/toys/jelly-jade-unicorn/model-web-v001.glb
```

## Asset Rules

- Keep source GLB files locally in `assets/models/source/`; Git ignores them.
- Do not reference source models from React or Three.js code.
- Only optimized runtime GLBs should live in `public/models/toys/`.
- Prefer Draco or Meshopt geometry compression.
- Consider KTX2 or Basis for texture-heavy models.
- Remove unused nodes, cameras, lights, animations, and materials before export.
- Keep mobile model variants lighter than desktop.
- Use poster images for catalog and first-paint placeholders.

## List Thumbnail Strategy

Collection, feed, friend, and draw-history lists use WebP stills rendered from
the real Mobile GLB. They do not mount a live `ToyViewer` per item. The first
visible render is queued and persisted in IndexedDB; later page loads use the
cached image. `ToyViewer` and the thumbnail renderer share the same versioned
material factory for legacy jade and V2 materials.

See `playbooks/toy-thumbnail-rendering.md` for cache versioning, performance
rules, and the future Supabase Storage boundary.

## Collect Series Showcase Strategy

The Collect series shelf is not a generic item list. It uses one WebGL canvas and
renderer per series card, with two to twelve model roots placed under separate
local pivots in one scene. All pivots consume the same rotation value, so pointer
drag and keyboard input rotate the full row in place.

This is a narrow exception to the thumbnail strategy:

- never mount one `ToyViewer` or canvas per series member; the current shelf should
  stay near five WebGL contexts rather than about twenty-three;
- initialize the first color-series stage first and lazy-initialize special-series
  stages near the viewport;
- request mobile GLBs through `loadToyModel`, whose promise cache deduplicates
  download and Draco decoding across cards;
- load members in parallel and add each model to the stage as soon as it is ready;
- use tile-level lightweight materials, a low initial pixel-ratio cap, and stop
  rendering once motion and loading have settled;
- change palettes by rebinding or updating materials on loaded model roots; do not
  refetch a GLB or recreate the scene, canvas, or renderer.

Poster or thumbnail fallbacks may cover loading and WebGL-unavailable states, but
must not replace rotation after the live stage is ready. Special-series cards keep
one model row above the information panel on desktop and mobile.

The standardized model workflow lives in:

`playbooks/model-asset-pipeline.md`

## Viewer Extraction Requirements

The shared ThreeViewer supports or should continue to support:

- Model URL input.
- Loading progress.
- Error state.
- Optional Draco.
- Optional OrbitControls.
- Auto bounding box, centering, and camera distance.
- Reset view.
- Responsive canvas.
- Mobile touch support.
- Pixel ratio caps.
- Page visibility pause.
- Reduced motion support.
- WebGL unavailable fallback.
- Model switching.
- Resource disposal for geometry, material, texture, renderer, and event listeners.
- Versioned jade and V2 material mapping without duplicating base model geometry.

## Deployment Notes

GLB files must be deployed with the site because the browser requests them at runtime. Vercel currently adds long cache headers for `*.glb` through `vercel.json`.

Source GLB files do not need to be deployed or pushed. They stay in the local
`assets/models/source/` workspace and are never served as public URLs.

When replacing a model, update:

1. Asset file.
2. Asset path in config or data.
3. Model version.
4. Vercel cache strategy if filename is reused.
5. Smoke test on desktop and mobile.
