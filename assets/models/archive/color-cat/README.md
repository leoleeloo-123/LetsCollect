# Retired Color Cat v001

Color Cat v001 was retired on 2026-07-23 and replaced by the yarn-focused
Color Cat v002. This directory preserves the complete rollback path.

- `source/`: original high-resolution v001 GLB and source notes (GLB remains local and Git-ignored)
- `runtime/`: optimized v001 GLB and its protection mask
- `builders/`: the final v001 protection-mask builder
- `mask-builders/`: earlier mask experiments v001-v007
- `masks/`: mask history notes
- `code/`: former Lab page/viewer, shader, production material helper, and Lab CSS

Nothing in this archive is requested by the active frontend. The active product
keeps the stable `color-cat` ID and loads `public/models/toys/color-cat/model-mobile-v002.glb`.

## Restore

To roll back, restore the v001 runtime and mask to `public/models/toys/color-cat/`,
restore the archived production material helper and Lab code, and change the
Color Cat catalog rendering mode back to its mask-based v001 contract.
