# Color Animals V3 rollout

Status: active MVP direction
Date: 2026-07-19

## Decision

The active React MVP moves from the eight-material crystal showcase to a mobile-first Color Animals series. The active draw models are Color Otter, Color Bird, Color Teddy, Color Bunny, Color Cat, and Color Panda. A collectible varies by animal model, body-color palette, quality, and seed while its material stays a fixed soft matte resin treatment.

The former jelly-jade and material-generation assets, catalogs, and generator remain in the repository as a legacy rollback path. They are not part of the active draw pool or seeded collection.

Color Dog and Color Unicorn are retired but fully preserved under `assets/models/archive/`, including original sources, optimized GLBs, masks, builders, and former Lab/production code.

## Reason

- The colored source GLBs preserve eyes, nose, mouth, and other authored facial details more reliably than rebuilding those details on an unpainted model.
- Fixed model-specific protection shaders make random color changes predictable and inexpensive on mobile.
- The product should present one coherent toy language instead of mixing crystal, metal, wood, and soft-character styles.

## Active contract

- `generationVersion = 3` identifies Color Animals collectibles.
- Active model and palette choices live in a shared series configuration, never in page components.
- Color Otter uses `model-mobile-v008.glb`; only the named `Lollipop_Color` material changes palette, with no additional mask request.
- Color Bird uses `model-mobile-v001.glb` and its production zone mask.
- Color Teddy uses `model-mobile-v001.glb` and `protect-mask-mobile-v001.webp`.
- Color Bunny uses `model-mobile-v002.glb`; only its suitcase is recolored through `protect-mask-mobile-v001.webp`.
- Color Cat uses `model-mobile-v001.glb` and a three-channel `protect-mask-mobile-v001.webp`.
- Color Panda uses `model-mobile-v002.glb`; only its hat is recolored through `hat-mask-mobile-v001.webp`.
- Draws select one of the six active models and one color palette independently with equal probability.
- Material is fixed to soft matte resin; each model's eyes and authored facial details remain protected by its production shader.
- The appearance signature includes the generation version, series, model, palette, rendering asset URL, traits, and seed.

## Local data migration

The Color Animals demo uses a dedicated local-storage key. Earlier material-showcase data remains untouched for rollback. Pages continue to consume `Collectible` domain objects and do not read storage directly.

## Mobile budget

- Mobile GLB target: below 1 MB per active model.
- Color Otter mobile GLB: about 360 KB; no protection mask is required.
- Color Bird mobile GLB remains below the 1 MB target and uses a compact zone mask.
- Color Teddy mobile GLB: about 356 KB; protection mask: about 7 KB.
- Color Bunny mobile GLB: about 381 KB; protection mask: about 52 KB.
- Color Cat mobile GLB: about 319 KB; protection mask: about 100 KB.
- Color Panda mobile GLB: about 431 KB; hat mask: about 6 KB.
- Color Bunny and Color Panda v002 preserve the v001 geometry while padding the 1024 px base-color atlas borders to reduce UV seam bleeding at tile size.
- The home series grid uses six lightweight live viewers with a conservative first-paint DPR and a settled DPR cap of 1.75; collection lists use cached WebP thumbnails.

## Validation

Before release:

1. Type-check and production-build the exact intended change set.
2. Verify home, draw, reveal, collection, detail, and friends routes at a narrow mobile viewport.
3. Confirm repeated draws can produce all six active Color Animals models with random palettes and add them to the collection.
4. Confirm all six models preserve their validated authored details in the live viewer and cached thumbnails.
5. Confirm no crystal/material language is visible in active product pages.
6. Confirm the previous storage entry and all legacy models remain available.

## Rollback

Re-enable the legacy material catalog and generator, switch the state adapter back to its earlier storage key, and restore the previous mock datasets. No GLB or legacy generator assets need to be recovered from history.
