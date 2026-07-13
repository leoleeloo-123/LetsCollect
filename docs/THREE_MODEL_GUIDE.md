# Three Model Guide

## Current Model

Current deployed GLB:

`public/models/toys/jelly-jade-unicorn/model-web-v001.glb`

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

- Do not commit uncompressed source GLB files.
- Keep original source files outside Git or in ignored paths.
- Prefer Draco or Meshopt geometry compression.
- Consider KTX2 or Basis for texture-heavy models.
- Remove unused nodes, cameras, lights, animations, and materials before export.
- Keep mobile model variants lighter than desktop.
- Use poster images for catalog and first-paint placeholders.

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

When replacing a model, update:

1. Asset file.
2. Asset path in config or data.
3. Model version.
4. Vercel cache strategy if filename is reused.
5. Smoke test on desktop and mobile.
