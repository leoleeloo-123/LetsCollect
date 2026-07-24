# Color Animals V3 rollout

Status: active MVP direction
Date: 2026-07-19
Last updated: 2026-07-24

## Decision

The active React MVP moves from the eight-material crystal showcase to a mobile-first Color Animals series. The active matte models are Color Otter, Color Bird, Color Teddy, Color Bunny, Color Cat, Color Panda, Color Bear Singer, Color Dog Camera, Color Dog Drum, and Color Seal. A collectible varies by animal model, model-specific colorway, quality, and seed while its material stays a fixed soft matte resin treatment. A selected colorway changes only the approved recolor target for that model; it does not imply that every model changes its full body color.

The former jelly-jade and material-generation assets, catalogs, and generator remain in the repository as a legacy rollback path. They are not part of the active draw pool or seeded collection.

Diamond Unicorn and Diamond Dog share a separate 5% special-exhibit branch. Their full contract is recorded in `docs/DIAMOND_UNICORN_SPECIAL_EXHIBIT.md`.

The former generic Color Dog, Color Unicorn, and the retired Color Cat v001 remain rollback history. Color Dog Camera and Color Dog Drum are distinct active product models.

The authoritative human-readable inventory, exact runtime sizes, recolor targets, palette IDs, availability states, and campaign feasibility rules are recorded in `docs/ASSET_CAPABILITY_REGISTRY.md`.

## Reason

- The colored source GLBs preserve eyes, nose, mouth, and other authored facial details more reliably than rebuilding those details on an unpainted model.
- Fixed model-specific protection shaders and named-material controls make approved recolor targets predictable and inexpensive on mobile.
- The product should present one coherent toy language instead of mixing crystal, metal, wood, and soft-character styles.

## Active contract

- `generationVersion = 3` identifies active collectibles.
- Active model and palette choices live in a shared series configuration, never in page components.
- Color Otter uses `model-mobile-v008.glb`; only the named `Lollipop_Color` material changes the lollipop colorway, with no additional mask request.
- Color Bird uses `model-mobile-v001.glb`; its selected palette controls the main body, a deterministic accent controls the cap, and the production zone mask protects the face, feet, and blush.
- Color Teddy uses `model-mobile-v001.glb`; `protect-mask-mobile-v001.webp` limits recoloring to the coat target and protects the face, muzzle, and blush.
- Color Bunny uses `model-mobile-v002.glb`; only its suitcase is recolored through `protect-mask-mobile-v001.webp`.
- Color Cat uses `model-mobile-v002.glb`; only the named `color_cat_new_yarn` material changes the yarn colorway, with no additional mask request.
- Color Panda uses `model-mobile-v002.glb`; only its hat is recolored through `hat-mask-mobile-v001.webp`.
- Color Bear Singer uses `model-mobile-v006.glb`; only the protected afro region accepts the selected palette.
- Color Dog Camera uses `model-mobile-v001.glb`; its hat and bag use `accessory-mask-mobile-v001.webp`.
- Color Dog Drum uses `model-mobile-v001.glb`; its validated drum region accepts the selected palette.
- Color Seal uses `model-mobile-v001.glb`; two compact masks isolate the starfish prop.
- The regular 95% compatibility draw branch selects one of the ten matte models and one of the nine shared primary colorway IDs independently with equal probability.
- A separate 5% compatibility branch selects Diamond Unicorn or Diamond Dog and one of five diamond colors.
- The normal ten use fixed soft matte resin; the two special exhibits use the shared faceted diamond material.
- The appearance signature includes the generation version, series, model, palette, material, rendering asset key, traits, and seed.

## Local data migration

The Color Animals demo uses a dedicated local-storage key. Earlier material-showcase data remains untouched for rollback. Pages continue to consume `Collectible` domain objects and do not read storage directly.

## Mobile budget

- Mobile GLB target: below 1 MB per active model.
- Color Otter mobile GLB: about 360 KB; no protection mask is required.
- Color Bird mobile GLB remains below the 1 MB target and uses a compact zone mask.
- Color Teddy mobile GLB: about 356 KB; protection mask: about 7 KB.
- Color Bunny mobile GLB: about 381 KB; protection mask: about 52 KB.
- Color Cat mobile GLB: about 657 KB; no protection mask is required.
- Color Panda mobile GLB: about 431 KB; hat mask: about 6 KB.
- Color Bear Singer v006: about 1.376 MB; this is a documented temporary exception to the 1 MB target and remains an optimization follow-up.
- Color Dog Camera: about 373 KB; accessory mask: about 14 KB.
- Color Dog Drum: about 374 KB; no mask request.
- Color Seal: about 320 KB; its two masks total about 25 KB.
- Diamond Unicorn special-exhibit GLB: about 175 KB; no textures or masks.
- Diamond Dog special-exhibit GLB: about 344 KB; no textures or masks.
- Color Bunny and Color Panda v002 preserve the v001 geometry while padding the 1024 px base-color atlas borders to reduce UV seam bleeding at tile size.
- Collect series cards and collection lists use cached WebP thumbnails; only reveal and selected detail mount a live viewer.

## Validation

Before release:

1. Type-check and production-build the exact intended change set.
2. Verify home, draw, reveal, collection, detail, and friends routes at a narrow mobile viewport.
3. Confirm the compatibility draw retains a 95% matte branch and a 5% two-model crystal branch.
4. Confirm all ten active Color Animals models can appear with registered colorways, change only their approved recolor targets, and add to the collection.
5. Confirm all ten matte models preserve their validated authored details in the live viewer and cached thumbnails.
6. Confirm both crystal models reveal, persist, render thumbnails, and open in the 3D detail view.
7. Confirm the previous storage entry and all legacy models remain available.

## Rollback

Re-enable the legacy material catalog and generator, switch the state adapter back to its earlier storage key, and restore the previous mock datasets. No GLB or legacy generator assets need to be recovered from history.
