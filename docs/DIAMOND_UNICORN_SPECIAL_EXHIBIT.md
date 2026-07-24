# Crystal special exhibits

Status: retained compatibility assets; Collect shelf card paused
Date: 2026-07-24

## Decision

Diamond Unicorn and Diamond Dog form the crystal exhibit family. In the legacy
compatibility draw they share a 5% branch and one of five equally distributed
diamond colors; the remaining 95% uses the twelve Color Animals models and nine
palettes.

The current Collect shelf does not expose a Crystal card and does not include
either crystal model in the nine-color Color series. The Color series now contains
twelve matte models. Crystal assets, existing collectibles, details, Labs, and
the legacy `/draw` compatibility branch remain intact so the card can be restored
later without rebuilding either GLB.

## Data and rendering boundary

- Series: `series_special_exhibits`
- Models: `diamond-unicorn`, `diamond-dog`
- Material: shared high-IOR faceted diamond material
- Native crystal palette IDs: `diamond-clear`, `diamond-ice`, `diamond-rose`, `diamond-champagne`, `diamond-mint`
- Supported historical tint inputs: the nine registered regular palette IDs
- Rarity: mythic
- Grade: `馆藏级钻石`
- Runtime models:
  - `public/models/toys/diamond-unicorn/model-mobile-v001.glb` — 174,984 bytes
  - `public/models/toys/diamond-dog/model-mobile-v001.glb` — 344,052 bytes

The Lab and product viewer share `src/three/material/createDiamondUnicornMaterial.ts`; page code does not contain model paths or material constants.

## Product boundaries

- Do not add either crystal model to `colorAnimalModels`.
- Do not count them toward matte-model atlas completion.
- Do allow both through active-collection persistence, thumbnails, detail and compatibility normalization.
- Keep the twelve Color Animals uniform inside the compatibility draw's 95% branch.
- Do not expose a Collect Crystal card or add crystal models to the Color pool
  until a later product decision explicitly restores them.

## Validation

1. Type-check and production-build.
2. Verify both crystal Labs load all five native colors.
3. Verify the compatibility draw communicates the 95% / 5% split.
4. Verify the current Collect shelf has no Crystal card or crystal member in the Color pool.
5. Verify forced or legacy crystal collectibles resolve model, palette, series, material, grade and persistence.
6. Verify both runtime GLB headers and declared byte lengths.

## Historical rollback

The original addition could be rolled back by removing Diamond Dog from the
special-exhibit registry and restoring the single-model branch. The current
shelf pause requires no asset rollback; restoring it only requires an explicit
series configuration and product-document update.
