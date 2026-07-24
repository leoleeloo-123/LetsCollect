# Crystal special exhibits

Status: active draw-pool addition
Date: 2026-07-23

## Decision

Diamond Unicorn and Diamond Dog form the crystal exhibit family. In the legacy
compatibility draw they share a 5% branch and one of five equally distributed
diamond colors; the remaining 95% keeps the ten Color Animals models and nine
palettes.

The new Collect shelf also exposes a guaranteed two-model Crystal series at a
higher ticket cost. The nine-color Color series may apply its selected color
value as a runtime tint to either crystal model.

## Data and rendering boundary

- Series: `series_special_exhibits`
- Models: `diamond-unicorn`, `diamond-dog`
- Material: shared high-IOR faceted diamond material
- Native crystal palette IDs: `diamond-clear`, `diamond-ice`, `diamond-rose`, `diamond-champagne`, `diamond-mint`
- Color-series tint inputs: the nine registered regular palette IDs
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
- Keep the ten Color Animals uniform inside the compatibility draw's 95% branch.

## Validation

1. Type-check and production-build.
2. Verify both crystal Labs load all five native colors.
3. Verify the compatibility draw communicates the 95% / 5% split.
4. Verify the Collect Crystal series contains exactly the two registered models.
5. Verify forced crystal collectibles resolve model, palette, series, material, grade and persistence.
6. Verify both runtime GLB headers and declared byte lengths.

## Rollback

Remove Diamond Dog from the special-exhibit registry and restore the single-model branch. The neutral GLBs, source notes and Labs can remain archived without affecting the matte pool.
