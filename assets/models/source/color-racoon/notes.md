# Color Racoon

## Source

- Imported: 2026-07-24
- Original file: `color-racoon.glb`
- Archived source: `model-source-v001.glb`
- Source size: 76,196,456 bytes
- Source geometry: 1,998,406 triangles; 1,010,591 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-racoon/model-mobile-v001.glb`
- Size: 327,400 bytes
- Geometry: 59,952 triangles; 35,551 uploaded vertices
- Compression: Draco geometry, 1024px WebP textures

## Color behavior

- Fixed: Racoon body, face, eyes, nose, mouth, cheeks, paws, and candy stick
- Colorable: the red-orange sugar coating on the tanghulu
- Mask: `tanghulu-mask-mobile-v001.webp`, 8,464 bytes, lossless 512 x 512 WebP
- Selection combines saturated red-orange UV candidates with a model-space
  tanghulu-side gate so facial reds remain unchanged.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-racoon/model-source-v001.glb `
  public/models/toys/color-racoon/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false
```

```powershell
python scripts/3d/build-color-racoon-mask-v001.py
```
