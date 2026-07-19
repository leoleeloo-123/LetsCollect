# Color Animals V3 rollout

Status: active MVP direction
Date: 2026-07-19

## Decision

The active React MVP moves from the eight-material crystal showcase to a mobile-first Color Animals series. The first active model is Color Dog. A collectible varies by animal model, body-color palette, quality, and seed while its material stays a fixed soft matte resin treatment.

The former jelly-jade and material-generation assets, catalogs, and generator remain in the repository as a legacy rollback path. They are not part of the active draw pool or seeded collection.

## Reason

- The colored source GLB preserves eyes, nose, mouth, and paw details more reliably than rebuilding those details on an unpainted model.
- A fixed protected-coat shader makes random color changes predictable and inexpensive on mobile.
- The product should present one coherent toy language instead of mixing crystal, metal, wood, and soft-character styles.

## Active contract

- `generationVersion = 3` identifies Color Animals collectibles.
- Active model and palette choices live in a shared series configuration, never in page components.
- Color Dog uses `model-mobile-v002.glb` and `protect-mask-mobile-v028.webp`.
- Draws currently select one active model and one color palette with equal probability.
- Material is fixed to soft matte resin; eyes, nose, mouth, and paw-pad details remain protected by the model mask.
- The appearance signature includes the generation version, series, model, palette, mask URL, traits, and seed.

## Local data migration

The Color Animals demo uses a new local-storage key. Earlier V5 material-showcase data remains untouched for rollback, while the V6 initial collection starts with two Color Dog variants. Pages continue to consume `Collectible` domain objects and do not read storage directly.

## Mobile budget

- Mobile GLB target: below 1 MB per active model.
- Color Dog mobile GLB: about 344 KB.
- Color Dog protection mask: about 6 KB.
- Only the focused hero, reveal, or detail view loads a live GLB; lists use cached WebP thumbnails.

## Validation

Before release:

1. Type-check and production-build the exact intended change set.
2. Verify home, draw, reveal, collection, detail, and friends routes at a narrow mobile viewport.
3. Confirm a draw produces a V3 Color Dog with a random palette and adds it to the collection.
4. Confirm no crystal/material language is visible in active product pages.
5. Confirm the previous V5 storage entry and all legacy models remain available.

## Rollback

Re-enable the legacy material catalog and V2 generator, switch the state adapter back to its V5 key, and restore the previous mock datasets. No GLB or legacy generator assets need to be recovered from history.
