# Three Model Guide

## Current Model

Current deployed GLB:

`public/models/toys/jelly-jade-unicorn/model-web-v001.glb`

Current source-only model waiting for optimization:

`assets/models/source/jelly-jade-kitty/model-source-v001.glb`

Current load path in page:

```js
gltfLoader.load("/models/toys/jelly-jade-unicorn/model-web-v001.glb", ...)
```

Current size:

About 2.35 MB.

## Current Loader

The hero page uses:

- Three.js `0.165.0`
- `GLTFLoader`
- `DRACOLoader`
- Draco decoder from jsDelivr
- `MeshPhysicalMaterial` retuned by variant

## Naming Direction

Future GLB names should be descriptive and versioned:

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

The standardized model workflow lives in:

`playbooks/model-asset-pipeline.md`

## Viewer Extraction Requirements

The future ThreeViewer should support:

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
