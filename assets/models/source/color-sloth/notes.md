# Color Sloth source notes

- Imported: 2026-07-27
- Original delivered filename: `color-sloth.glb`
- Canonical source: `model-source-v001.glb`
- Source size: 63,027,728 bytes
- Source SHA-256: `4EB3BDC085FCF7D6ED97F54A7874CDEA4CE1D8398D033A87A00190291859375E`
- Source geometry: one mesh, one primitive, 1,988,226 triangles
- Source materials: one PBR material
- Source textures: 4096 × 4096 base-color PNG and 4096 × 4096 metallic-roughness PNG

## Runtime

- Active experimental runtime: `public/models/toys/color-sloth/model-mobile-v001.glb`
- Runtime size: 293,836 bytes
- Runtime geometry: 59,644 triangles
- Runtime textures: 1024 × 1024 WebP base color and metallic-roughness
- Hat mask: `public/models/toys/color-sloth/hat-mask-mobile-v001.webp`
- Hat mask size: 1,708 bytes, 1024 × 1024 lossless WebP
- Lab route: `/color-sloth-lab`

This runtime is an internal experimental Lab asset. It is not active in the
product catalog or draw pool.

## Recolor contract

Only the original magenta knitted hat is recolorable. The sloth fur, face,
eyes, nose, mouth, clothing, camera/technical equipment, and all other
accessories remain protected by the original texture.

The mask builder combines the original magenta RGB seed with deep-magenta HSV
coverage and a narrowly constrained wrapped-red pass beside confirmed hat texels.
Small disconnected atlas regions are removed before export, protecting the warm
beige and brown fur while keeping dark knitted folds inside the hat mask.

## Rebuild

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-sloth/model-source-v001.glb `
  public/models/toys/color-sloth/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

python scripts/3d/build-color-sloth-mask-v001.py
```

## Rollback

The source GLB above is the authoritative rollback input. Rebuild the runtime
and mask from it; do not edit or overwrite the source file.
