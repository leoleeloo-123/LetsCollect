# Color Dog Camera

## Source

- Imported: 2026-07-24
- Original file: `color-dog-camera.glb`
- Archived source: `model-source-v001.glb`
- Source size: 85,696,312 bytes
- Source geometry: 1,998,734 triangles; 1,017,667 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-dog-camera/model-mobile-v001.glb`
- Size: 372,848 bytes
- Geometry: 59,962 triangles; 38,007 uploaded vertices
- Compression: Draco geometry, 1024px WebP textures

## Color behavior

- Fixed: dog fur, face, eyes, nose, mouth, camera, and white hardware
- Colorable: the original yellow hat and yellow bag, including straps and trim
- Mask: `accessory-mask-mobile-v001.webp`, 13,820 bytes
- The mask is generated from the optimized base-color texture by
  `scripts/3d/build-color-dog-camera-mask-v001.py`.

## Build command

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-dog-camera/model-source-v001.glb `
  public/models/toys/color-dog-camera/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false
```
