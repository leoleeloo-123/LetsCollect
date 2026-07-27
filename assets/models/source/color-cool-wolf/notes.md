# Color Cool Wolf

## Source

- Imported: 2026-07-27
- Original file: `color-cool-wolf.glb`
- Archived source: `model-source-v001.glb`
- Source size: 82,859,176 bytes
- SHA-256: `6e9e1078afd98a0647b3464eab87d9b48ddd403c96524c96e49993c13bdb1f09`
- Source geometry: one mesh, one primitive, 1,999,148 triangles; 1,015,129 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-cool-wolf/model-mobile-v001.glb`
- Size: 349,456 bytes
- Geometry: 59,974 triangles; 36,826 uploaded vertices
- Compression: Draco geometry, two 1024px WebP textures

## Color behavior

- Fixed: wolf, eyes, ears, fur, clothing, paws, accessories, and all other details
- Colorable: only the three authored magenta ear studs
- Mask: `ear-stud-mask-mobile-v001.webp`
- Mask size: 1,776 bytes
- The mask includes bright and shadowed authored magenta pixels at their original texture boundary, then combines them with a tight object-space gate around the pierced ear.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-cool-wolf/model-source-v001.glb `
  public/models/toys/color-cool-wolf/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-cool-wolf/model-mobile-v001.glb `
  C:/tmp/color-cool-wolf-inspect-20260727/model.gltf

python scripts/3d/build-color-cool-wolf-mask-v001.py `
  --unpacked C:/tmp/color-cool-wolf-inspect-20260727
```
