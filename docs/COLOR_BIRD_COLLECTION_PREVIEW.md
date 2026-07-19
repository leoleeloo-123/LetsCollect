# Color Bird collection preview

## Scope

Color Bird is available as a collection-only mobile preview in the Color Animals V3 series. Two seeded variants appear in a fresh demo collection, while random draws continue to use Color Dog until the bird is approved on real phones.

## Runtime profile

- Mobile GLB: `/models/toys/color-bird/model-mobile-v001.glb` (about 310 KB)
- Active zone mask: `/models/toys/color-bird/protect-mask-mobile-v014.webp` (about 18 KB)
- List rendering: cached WebP thumbnails; no live WebGL canvas per collection item
- Detail rendering: one interactive WebGL viewer is created only after opening a collectible

## Rendering boundary

The product catalog declares a `color-bird-zones` rendering mode. The shader uses the authored texture plus a multi-channel mask to recolor the body and cap while retaining the eye and beak details. A lightweight geometry attribute keeps the feet in their authored orange tone where the UV layout is shared with the body.

## Validation

- TypeScript typecheck and production build must pass.
- A fresh mobile-width session must show two dogs and two birds in the collection.
- Both bird thumbnails must render from the mobile GLB.
- Opening a bird must load the interactive model and preserve the protected details.
- The draw generator must continue to choose from `drawModelIds`, currently Color Dog only.

## Rollback

Remove Color Bird from `colorAnimalsSeries.modelIds` and from `starterCollectionToys`, then restore the previous local demo storage key. The Color Dog rendering path and draw pool remain independent and require no asset rollback.
