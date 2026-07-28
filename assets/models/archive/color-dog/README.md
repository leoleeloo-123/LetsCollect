# Legacy Color Dog implementation archive

Status: retired from the active Color Animals pool on 2026-07-22 and replaced by Color Otter.

- The original geometry was promoted to `assets/models/source/diamond-dog/` on 2026-07-24.
- The optimized geometry now lives at `public/models/toys/diamond-dog/model-mobile-v001.glb`.
- `runtime/` keeps the former v027/v028 Color Dog protection masks.
- `protect-masks/` keeps earlier mask experiments.
- `builders/` keeps all retained mask builders.
- `code/` keeps the former Lab page, Lab viewer, and production protected-coat material helper.

Nothing in this directory is requested by the active frontend. Diamond Dog uses
only the promoted geometry and the shared Diamond Unicorn physical material.
To restore the retired Color Dog treatment, rebuild or copy the promoted
geometry back to `public/models/toys/color-dog/`, restore the selected mask,
catalog definition, and archived material helper, then bump the local demo
storage key.