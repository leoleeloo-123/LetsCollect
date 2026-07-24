# Diamond Unicorn special exhibit

Status: active draw-pool addition
Date: 2026-07-23

## Decision

Diamond Unicorn is a rare, separate exhibit inside the active V3 draw system. It has a 5% probability per draw and one of five equally distributed diamond colors. The remaining 95% keeps the existing six Color Animals models and nine palettes.

The exhibit is intentionally excluded from the homepage model grid. After discovery it behaves like any owned collectible: it appears in the reveal, recent draws, collection grid, cached thumbnail, and 3D detail view, and it persists after refresh.

## Data and rendering boundary

- Series: `series_special_exhibits`
- Model: `diamond-unicorn`
- Material: shared high-IOR faceted diamond material
- Palette IDs: `diamond-clear`, `diamond-ice`, `diamond-rose`, `diamond-champagne`, `diamond-mint`
- Rarity: mythic
- Grade: `馆藏级钻石`
- Runtime model: `public/models/toys/diamond-unicorn/model-mobile-v001.glb`
- Runtime size: 174,984 bytes

The Lab and product viewer share `src/three/material/createDiamondUnicornMaterial.ts`; page code does not contain model paths or material constants.

## Product boundaries

- Do not add Diamond Unicorn to `colorAnimalModels` or the homepage grid.
- Do not count it toward the normal six-model or nine-color atlas completion.
- Do allow it through active-collection persistence and compatibility normalization.
- Keep the normal Color Animals probability uniform inside their 95% branch.

## Validation

1. Type-check and production-build.
2. Verify the Diamond Unicorn Lab loads all five colors.
3. Verify the draw page communicates the 95% / 5% split.
4. Verify the homepage remains the same six normal models.
5. Verify a forced Diamond Unicorn collectible resolves its model, palette, special series, material, grade, and persistence predicate.
6. Verify the runtime GLB header and declared byte length.

## Rollback

Remove the special-exhibit branch from the generator and active persistence predicate, then remove the catalog entries and route. The neutral GLB, source notes, and Lab can remain archived without affecting the normal six-model draw pool.
