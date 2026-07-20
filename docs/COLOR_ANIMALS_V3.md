# Color Animals V3 rollout

Status: active MVP direction
Date: 2026-07-19

## Decision

The active React MVP moves from the eight-material crystal showcase to a mobile-first Color Animals series. The active draw models are Color Dog, Color Bird, Color Teddy, Color Bunny, and Color Cat. A collectible varies by animal model, body-color palette, quality, and seed while its material stays a fixed soft matte resin treatment.

The former jelly-jade and material-generation assets, catalogs, and generator remain in the repository as a legacy rollback path. They are not part of the active draw pool or seeded collection.

## Reason

- The colored source GLBs preserve eyes, nose, mouth, and other authored facial details more reliably than rebuilding those details on an unpainted model.
- Fixed model-specific protection shaders make random color changes predictable and inexpensive on mobile.
- The product should present one coherent toy language instead of mixing crystal, metal, wood, and soft-character styles.

## Active contract

- `generationVersion = 3` identifies Color Animals collectibles.
- Active model and palette choices live in a shared series configuration, never in page components.
- Color Dog uses `model-mobile-v002.glb` and `protect-mask-mobile-v028.webp`.
- Color Bird uses `model-mobile-v001.glb` and its production zone mask.
- Color Teddy uses `model-mobile-v001.glb` and `protect-mask-mobile-v001.webp`.
- Color Bunny uses `model-mobile-v001.glb`; only its suitcase is recolored through `protect-mask-mobile-v001.webp`.
- Color Cat uses `model-mobile-v001.glb` and a three-channel `protect-mask-mobile-v001.webp`.
- Draws select one of the five active models and one color palette independently with equal probability.
- Material is fixed to soft matte resin; each model's eyes and authored facial details remain protected by its production shader.
- The appearance signature includes the generation version, series, model, palette, rendering asset URL, traits, and seed.

## Local data migration

The Color Animals demo uses a dedicated local-storage key. Earlier material-showcase data remains untouched for rollback. Pages continue to consume `Collectible` domain objects and do not read storage directly.

## Mobile budget

- Mobile GLB target: below 1 MB per active model.
- Color Dog mobile GLB: about 344 KB; protection mask: about 6 KB.
- Color Bird mobile GLB remains below the 1 MB target and uses a compact zone mask.
- Color Teddy mobile GLB: about 356 KB; protection mask: about 7 KB.
- Color Bunny mobile GLB: about 377 KB; protection mask: about 52 KB.
- Color Cat mobile GLB: about 319 KB; protection mask: about 100 KB.
- Only the focused hero, reveal, or detail view loads a live GLB; lists use cached WebP thumbnails.

## Validation

Before release:

1. Type-check and production-build the exact intended change set.
2. Verify home, draw, reveal, collection, detail, and friends routes at a narrow mobile viewport.
3. Confirm repeated draws can produce all five active Color Animals models with random palettes and add them to the collection.
4. Confirm all five models preserve their validated authored details in the live viewer and cached thumbnails.
5. Confirm no crystal/material language is visible in active product pages.
6. Confirm the previous storage entry and all legacy models remain available.

## Rollback

Re-enable the legacy material catalog and generator, switch the state adapter back to its earlier storage key, and restore the previous mock datasets. No GLB or legacy generator assets need to be recovered from history.
