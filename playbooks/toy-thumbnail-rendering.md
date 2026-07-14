# Toy Thumbnail Rendering

This playbook defines how Let's Collect shows recognizable toys in collection,
feed, friend, and draw-history lists without mounting one WebGL canvas per card.

## Product Rule

Use the real GLB for the image, but do not use live 3D for list presentation.

```text
Collection / feed / history -> cached WebP thumbnail
Draw reveal / toy detail    -> live ToyViewer
```

The thumbnail is a disposable derivative. The collectible's identity remains:

```text
modelId
paletteId
appearance vector
appearanceSeed
generationVersion
appearanceSignature
```

Never derive rarity or ownership from a thumbnail URL.

## Current Runtime Flow

1. `ToyThumbnail` starts only when it enters the viewport.
2. IndexedDB is checked with a versioned cache key.
3. On a cache miss, one global render queue loads the Mobile GLB.
4. The shared jade material maps the same five-dimensional vector used by
   `ToyViewer`.
5. A `384 x 384` WebP is rendered and saved to IndexedDB.
6. The offscreen WebGL context is released after the queue becomes idle.
7. Later renders and page refreshes read the image without decoding the GLB.

Relevant files:

```text
src/components/toys/ToyThumbnail.tsx
src/three/ThumbnailRenderer/renderer.ts
src/three/ThumbnailRenderer/storage.ts
src/three/material/createJadeMaterial.ts
```

## Performance Contract

- Never mount a `ToyViewer` for each card.
- Keep thumbnail rendering serial; one WebGL context is enough.
- Use the Mobile GLB for thumbnail generation.
- Use `IntersectionObserver` so offscreen collection items do no work.
- Cache binary `Blob` values in IndexedDB, not base64 in localStorage.
- Release the offscreen renderer after a short idle window.
- Keep thumbnail dimensions at `384 x 384` unless visual QA proves that a
  different budget is necessary.
- A thumbnail failure must leave a stable placeholder and must not block the
  collection page.

## Cache Versioning

The cache key contains:

```text
thumbnail render version
active Mobile GLB path
collectible appearanceSignature
```

Increase `THUMBNAIL_RENDER_VERSION` when camera, lighting, material mapping,
background, encoding, or framing changes. Changing the active model filename
also invalidates old thumbnails automatically.

Do not overwrite an already deployed GLB filename. Model paths are part of the
render identity and provide cache-safe rollback.

## Adding A New Toy

1. Run the GLB through `playbooks/model-asset-pipeline.md`.
2. Add its Web and Mobile paths to `src/features/toys/catalog.ts`.
3. Add framing overrides only when automatic bounds are insufficient.
4. Generate or draw a collectible that uses the new `modelId`.
5. Verify the first thumbnail, a refresh cache hit, and the live detail viewer.

No collection-card or feed component should need model-specific code.

## Future Supabase Migration

When cloud persistence is enabled, keep the same rendering contract:

```text
toy-thumbnails/{generationVersion}/{collectibleId}/render-v{N}.webp
```

Suggested derived fields:

```text
thumbnail_url
thumbnail_render_version
thumbnail_status: pending | ready | failed
```

The browser can upload a generated image after draw reveal, or a background
worker can render it later. Lists should use a CDN URL when present and fall
back to IndexedDB generation for local-only MVP collectibles.

## QA Checklist

- The toy silhouette matches the source GLB at card size.
- Horns, ears, wings, tails, and face details are not cropped.
- Color and material respond to the collectible parameters.
- Six initial toys do not create six live canvases.
- A page refresh shows cached thumbnails without model regeneration.
- Mobile scrolling stays responsive while uncached thumbnails are queued.
- IndexedDB-disabled mode still reaches a visible rendered result for the
  current session.
- WebGL failure shows a stable placeholder without a console error loop.
