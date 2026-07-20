# 3D Model Asset Inventory

This directory contains source and archived 3D work. Nothing here is served to the browser.

## Source models

| Toy | Source GLB | Runtime status |
| --- | --- | --- |
| Color Dog | `source/color-dog/model-source-v001.glb` | Active mobile runtime: `public/models/toys/color-dog/model-mobile-v002.glb` (344,052 bytes) |
| Color Unicorn | `source/color-unicorn/model-source-v001.glb` | Raw source retained; current recoloring experiment is not active |
| Color Bird | `source/color-bird/model-source-v001.glb` | Active mobile runtime: 310 KB GLB and v014 zone mask |
| Color Teddy | `source/color-teddy/model-source-v001.glb` | Active mobile runtime: 356,132-byte GLB and 7,404-byte protection mask |
| Color Bunny | `source/color-bunny/model-source-v001.glb` | Active mobile runtime: 376,784-byte GLB and 52,372-byte bag mask |
| Color Cat | `source/color-cat/model-source-v001.glb` | Active mobile runtime: 319,172-byte GLB and 100,394-byte three-channel protection mask |
| Jelly Jade toys | `source/jelly-jade-*/model-source-v001.glb` | Existing production family |

Source GLBs under `assets/models/source/` are local-only inputs and are ignored by Git.

## Archive

- `archive/color-dog/`: superseded protection masks and the v027 builder kept for rollback and regeneration.
- `archive/color-unicorn/runtime-experiment/`: unused optimized model and mask from the earlier recoloring experiment.
- `archive/color-bird/`: superseded v001-v013 masks and the v011 builder retained as validation history.
- `archive/color-cat/mask-builders/`: superseded v001-v007 mask builders retained as validation history.

Only active, mobile-sized runtime files belong under `public/models/toys/`.
