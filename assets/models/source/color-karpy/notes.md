# Color Karpy

## Source

- Imported: 2026-07-24
- Original file: `color-karpy.glb`
- Archived source: `model-source-v001.glb`
- Source size: 81,531,888 bytes
- Source geometry: 1,939,970 triangles; 982,392 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-karpy/model-mobile-v001.glb`
- Size: 315,240 bytes
- Geometry: 58,198 triangles; 35,587 uploaded vertices
- Compression: Draco geometry, 1024px WebP textures

## Color behavior

- Fixed: Karpy body, white clothing, face, eyes, nose, mouth, paws, and blush
- Colorable: the original red hat at the top of the model
- Mask: `hat-mask-mobile-v001.webp`, 18,474 bytes, lossless 512 x 512 WebP
- Selection combines high-saturation red UV candidates with an object-space
  upper-head gate.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-karpy/model-source-v001.glb `
  public/models/toys/color-karpy/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false
```

```powershell
python scripts/3d/build-color-karpy-mask-v001.py
```
