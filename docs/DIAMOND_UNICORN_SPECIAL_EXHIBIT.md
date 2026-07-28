# Crystal special exhibits

Status: archived compatibility studies
Date: 2026-07-27

## Decision

Diamond Unicorn and Diamond Dog no longer fit the active Color Animals visual
language. Their editable sources have moved to `assets/models/archive/`, and
their special-exhibit draw probability is now zero.

The current Collect shelf and legacy `/draw` route contain twenty-four matte
models only. Compact crystal runtimes, five historical tint IDs, and internal
Labs remain so an existing browser-local collectible can still render and the
material study can be inspected without rebuilding either GLB.

## Data and rendering boundary

- Historical series: `series_special_exhibits`
- Models: `diamond-unicorn`, `diamond-dog`
- Material: shared high-IOR faceted diamond material
- Historical palette IDs: `diamond-clear`, `diamond-ice`, `diamond-rose`, `diamond-champagne`, `diamond-mint`
- Archived sources:
  - `assets/models/archive/diamond-unicorn/source/`
  - `assets/models/archive/diamond-dog/source/`
- Compatibility runtimes:
  - `public/models/toys/diamond-unicorn/model-mobile-v001.glb` — 174,984 bytes
  - `public/models/toys/diamond-dog/model-mobile-v001.glb` — 344,052 bytes

The internal Labs and historical item renderer share
`src/three/material/createDiamondUnicornMaterial.ts`.

## Product boundaries

- Do not add either crystal model to `colorAnimalModels` or a Collect series.
- Do not generate either model through `/draw`, campaigns, Agent proposals, or
  seeded demo collections.
- Do not count them toward active-model completion.
- Do allow an already stored local crystal item to resolve its model, tint,
  thumbnail, and 3D detail.
- Restoring a crystal series requires a new explicit product decision, source
  move, catalog review, draw-policy change, and mobile validation.

## Validation

1. Type-check and production-build.
2. Verify all new draws resolve to one of the twenty-four matte models.
3. Verify the Collect shelf has no Crystal card or crystal member.
4. Verify a forced historical crystal item still renders in thumbnail and 3D detail.
5. Verify both archive folders and compatibility runtimes remain recoverable.

## Restore path

Move the archived source folders back under `assets/models/source/`, restore a
non-zero special-series policy, update the current asset registry and product
documents, then revalidate both Labs and mobile rendering before release.
