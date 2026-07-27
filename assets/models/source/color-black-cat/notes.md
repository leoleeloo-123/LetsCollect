# Color Black Cat

## Source

- Imported: 2026-07-27
- Original file: `color-black-cat.glb`
- Archived source: `model-source-v001.glb`
- Source size: 73,111,356 bytes
- SHA-256: `92e073483c5bd61d65ce81e2b210b9ac508443d3848699d64b1f85224fec9f8c`
- Source geometry: one mesh, one primitive, 1,926,498 triangles; 984,131 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-black-cat/model-mobile-v001.glb`
- Size: 359,448 bytes
- Geometry: 57,792 triangles; 40,459 uploaded vertices
- Compression: Draco geometry, two 1024px WebP textures

## Color behavior

- Fixed: black cat, eyes, ears, whiskers, paws, cardboard box, seams, edges, and all other pink details
- Colorable: only the original pink fish Logo on the box
- Mask: `fish-logo-mask-mobile-v001.webp`
- Mask size: 10,582 bytes
- The mask is generated pixel-by-pixel from the authored magenta texture color, then combined with a tight object-space gate so reused pink texture regions cannot tint the cat or box.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-black-cat/model-source-v001.glb `
  public/models/toys/color-black-cat/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-black-cat/model-mobile-v001.glb `
  C:/tmp/color-black-cat-inspect-20260727/model.gltf

python scripts/3d/build-color-black-cat-mask-v001.py `
  --unpacked C:/tmp/color-black-cat-inspect-20260727
```
