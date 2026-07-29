# Color Bird collection preview

Status: archived full-body preview, superseded by the crown-only Color Bird v002
contract in `docs/COLOR_ANIMALS_V3.md`.

## Scope

This document records the retired 2026-07-19 full-body recolor experiment. The
active `color-bird` product ID now resolves to the new source v002 model and only
its crown accepts the selected palette.

## Runtime profile

- Archived mobile GLB: `assets/models/archive/color-bird/runtime/model-mobile-v001.glb` (310,308 bytes)
- Archived zone mask: `assets/models/archive/color-bird/masks/protect-mask-mobile-v014.webp` (17,840 bytes)
- Active replacement: `/models/toys/color-bird/model-mobile-v002.glb` with `/models/toys/color-bird/crown-mask-mobile-v001.webp` and `/models/toys/color-bird/crown-triangle-mask-mobile-v001.bin`
- List rendering: cached WebP thumbnails; no live WebGL canvas per collection item
- Detail rendering: one interactive WebGL viewer is created only after opening a collectible

## Rendering boundary

The retired catalog declared a `color-bird-zones` rendering mode. Its shader
recolored the body and cap through a multi-channel mask while retaining the eye,
beak, feet, and blush. The active v002 catalog instead uses the shared
`color-accessory-mask` path and isolates only the crown.

## Validation

- TypeScript typecheck and production build must pass.
- The archived code, source, runtime, and mask must remain available for local rollback.
- No browser URL may reference an asset under `assets/models/archive/color-bird/`.

## Rollback

Restore the archived runtime and full-body shader only through a new versioned
catalog change. Do not overwrite the active v002 runtime or crown mask.
