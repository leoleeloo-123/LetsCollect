# Color Penguin

## Source

- Imported: 2026-07-27
- Original file: `color-penguin.glb`
- Archived source: `model-source-v001.glb`
- Source size: 79,708,140 bytes
- SHA-256: `bbe6f13e031aab832b1a23ec6b0a78a70b8838011dd86d34da2b6084cf2712f3`
- Source geometry: one mesh, one primitive, 1,998,438 triangles; 1,014,200 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-penguin/model-mobile-v001.glb`
- Size: 330,292 bytes
- Geometry: 59,948 triangles; 36,932 uploaded vertices
- Compression: Draco geometry, two 1024px WebP textures

## Color behavior

- Fixed: penguin feathers, face, blush, beak, feet, eyes, hands, white earmuff pads, and the cup emblem
- Colorable: the original pink top earmuff area, pink scarf, and pink cup
- Mask: `accessory-mask-mobile-v001.webp`
- Mask size: 10,482 bytes
- Mask channels: red = earmuff top, green = source-pink pixels, blue = cup
- Exact cup triangle mask: 59,948 bytes; 4,720 selected triangles
- UV-mask channels are combined with object-space gates in the material shader so reused UV islands cannot tint the face or other fixed areas.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-penguin/model-source-v001.glb `
  public/models/toys/color-penguin/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-penguin/model-mobile-v001.glb `
  C:/tmp/color-penguin-inspect/model.gltf

python scripts/3d/build-color-penguin-mask-v001.py `
  --unpacked C:/tmp/color-penguin-inspect
```
