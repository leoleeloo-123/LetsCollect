# Color Sheep

## Source

- Imported: 2026-07-27
- Original file: `color-sheep.glb`
- Canonical source: `model-source-v001.glb`
- Source size: 61,702,384 bytes
- SHA-256: `9F07D763E9A4D2DFE106238645AA580E5B02537BDDFFB7E447ADE78F771D32C4`
- Source geometry: 1,998,026 triangles; 1,016,381 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-sheep/model-mobile-v001.glb`
- Size: 267,280 bytes
- Geometry: 59,940 triangles; 36,753 uploaded vertices
- Compression: Draco geometry, 1024px WebP textures

## Color behavior

- Fixed: sheep wool and body, face, eyes, lashes, nose, horns, ears, bag body,
  gold hardware, and all other authored details
- Colorable: the original magenta cape and the pink bow attached to the bag
- Mask: `accessory-mask-mobile-v001.webp`, 23,560 bytes (1024 x 1024 lossless WebP)
- Mask channels: red stores the cape; green stores the bag bow
- Builder: `scripts/3d/build-color-sheep-mask-v001.py`
- Validation route: `/color-sheep-lab`
- Status: internal experimental Lab asset; not registered in the active product
  catalog or draw pool

## Rebuild commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-sheep/model-source-v001.glb `
  public/models/toys/color-sheep/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

python scripts/3d/build-color-sheep-mask-v001.py
```

## Known compromises and rollback

- The source is a single textured mesh, so the two colorable accessories use a
  UV-derived mask rather than named materials.
- The canonical source GLB is the rebuild and rollback input. No earlier source
  or runtime version exists for this asset.
