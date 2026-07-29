# Color Penguin v003

## Source

- Imported: 2026-07-29
- Original file: `color-penguin-v3.glb`
- Active source: `model-source-v003.glb`
- Source size: 77,606,960 bytes
- SHA-256: `bb91cb49a5b3e75b6ea30b4903097c18c8169151460952999f479ef1f87dae08`
- Source geometry: one mesh, one primitive, 1,999,282 triangles; 1,016,769 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures
- Retired v001 and v002 assets are under
  `assets/models/archive/color-penguin/`.

## Runtime asset

- File: `public/models/toys/color-penguin/model-mobile-v003.glb`
- Size: 322,324 bytes
- SHA-256: `f880b0aca0fb6943c0adacb32883c25d696043ac79ecb59154e90451a1b1a25f`
- Geometry: 59,966 triangles; 38,507 uploaded vertices
- Compression: Draco geometry, two 1024px WebP textures

## Color behavior

- Fixed: feathers, face, blush, beak, feet, eyes, hands, white earmuff pads, cup emblem, and every non-pink detail
- Colorable: the source-pink earmuff top and source-pink cup
- Texture mask: `accessory-mask-mobile-v003.webp`
- Texture-mask size: 7,914 bytes
- Texture-mask SHA-256: `8acae5ff8e8bc42ae2c1a5f40300695e41e28d856f8ddca40782d07d1b063ada`
- Channels: red = earmuff top; green = cup source-pink coverage; blue = cup-heart protection; alpha = global source-pink pixels
- Triangle-zone mask: `zone-triangle-mask-mobile-v003.bin`
- Triangle-zone size: 59,966 bytes
- Triangle-zone SHA-256: `d61b31152b3df92932755e34719158c1ea8a75798ea9406868a33f6cb0d89e02`
- Selection: source-pink pixels locate four earmuff topology components and three cup topology components.
- The cup mask receives a one-pixel closure for its UV center seam. Object-space bounds include the shared pink cup rim and restore the shared pink strip below the cup to the belly color.
- The shader samples the mask with nearest filtering; the cup heart stays protected.

## Build commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-penguin/model-source-v003.glb `
  public/models/toys/color-penguin/model-mobile-v003.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-penguin/model-mobile-v003.glb `
  C:/tmp/color-penguin-v003-inspect/model.gltf `
  --vertex-layout separate

python scripts/3d/build-color-penguin-mask-v003.py `
  --unpacked C:/tmp/color-penguin-v003-inspect
```
