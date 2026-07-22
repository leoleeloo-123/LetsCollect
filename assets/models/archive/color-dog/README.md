# Color Dog archive

Status: retired from the active Color Animals pool on 2026-07-22 and replaced by Color Otter.

- `source/` keeps the original high-resolution GLB and import notes. Source GLBs remain local and Git-ignored.
- `runtime/` keeps the last deployed mobile GLB and v027/v028 protection masks.
- `protect-masks/` keeps earlier mask experiments.
- `builders/` keeps all retained mask builders.
- `code/` keeps the former Lab page, Lab viewer, and production protected-coat material helper.

Nothing in this directory is requested by the active frontend. To restore Color Dog, copy the selected runtime files back to `public/models/toys/color-dog/`, restore the catalog definition and archived material helper, then bump the local demo storage key.