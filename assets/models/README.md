# 3D Model Asset Inventory

This directory contains source and archived 3D work. Nothing here is served to the browser.

## Source models

| Toy | Source GLB | Runtime status |
| --- | --- | --- |
| Color Dog | `source/color-dog/model-source-v001.glb` | Active mobile runtime: `public/models/toys/color-dog/model-mobile-v002.glb` (344,052 bytes) |
| Color Unicorn | `source/color-unicorn/model-source-v001.glb` | Raw source retained; current recoloring experiment is not active |
| Color Bird | `source/color-bird/model-source-v001.glb` | Raw source archived on 2026-07-19; not optimized or deployed yet |
| Jelly Jade toys | `source/jelly-jade-*/model-source-v001.glb` | Existing production family |

Source GLBs under `assets/models/source/` are tracked with Git LFS.

## Archive

- `archive/color-dog/protect-masks/`: superseded protection-mask iterations kept for rollback and mask regeneration.
- `archive/color-unicorn/runtime-experiment/`: unused optimized model and mask from the earlier recoloring experiment.

Only active, mobile-sized runtime files belong under `public/models/toys/`.
