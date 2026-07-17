# Three Model Guide

## Current Model Pool

The runtime pool contains Unicorn, Kitty, Bunny, Bird, Doggy, and Karpy. Every
model has a Web and Mobile GLB under `public/models/toys/{toy-slug}/`.

All active Web models use about 100k triangles / 266-307 KB, and all Mobile
models use about 50k triangles / 142-165 KB. The original 2.35 MB unicorn Web
file remains available as the superseded V1 asset; the registry uses V2.

All runtime paths and per-model framing overrides are registered in:

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

- Keep source GLB files in `assets/models/source/` and track them with Git LFS.
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

Source GLB files do not need to be deployed. They can stay under `assets/`,
where they are available to the repo but not served as public URLs.

When replacing a model, update:

1. Asset file.
2. Asset path in config or data.
3. Model version.
4. Vercel cache strategy if filename is reused.
5. Smoke test on desktop and mobile.
