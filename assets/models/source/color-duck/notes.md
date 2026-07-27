# Color Duck source notes

- Imported: 2026-07-27
- Original delivered filename: `color-duck.glb`
- Canonical source: `model-source-v001.glb`
- Source size: 78,469,640 bytes
- Source SHA-256: `0CEBC752C27A93158160900D2116A6FC38EC62ED7D056DB2A676C65AF69C1699`
- Source geometry: one mesh, one primitive, 1,984,096 triangles
- Source materials: one PBR material
- Source textures: 4096 × 4096 base-color PNG and 4096 × 4096 metallic-roughness PNG

## Runtime

- Active experimental runtime: `public/models/toys/color-duck/model-mobile-v001.glb`
- Runtime size: 317,252 bytes
- Runtime geometry: 59,522 triangles
- Runtime textures: 1024 × 1024 WebP base color and metallic-roughness
- Active bath mask: `public/models/toys/color-duck/bath-mask-mobile-v003.webp`
- Active bath mask size: 40,436 bytes, 1024 × 1024 lossless WebP
- Active foam cleanup mask: `public/models/toys/color-duck/foam-cleanup-mask-mobile-v001.webp`
- Active foam cleanup mask size: 25,742 bytes, 1024 × 1024 lossless WebP
- Good baseline mask: `assets/models/archive/color-duck/masks/bath-mask-mobile-v001-good.webp`
- Good baseline builder: `assets/models/archive/color-duck/builders/build-color-duck-mask-v001-good.py`
- Bubble-reduced v002 mask: `assets/models/archive/color-duck/masks/bath-mask-mobile-v002-bubble-reduced.webp`
- Bubble-reduced v002 builder: `assets/models/archive/color-duck/builders/build-color-duck-mask-v002-bubble-reduced.py`
- Highlight-protected v003 mask: `assets/models/archive/color-duck/masks/bath-mask-mobile-v003-highlight-protected.webp`
- Highlight-protected v003 builder: `assets/models/archive/color-duck/builders/build-color-duck-mask-v003-highlight-protected.py`
- Lab route: `/color-duck-lab`

This runtime is an internal experimental Lab asset. It is not active in the
product catalog or draw pool.

## Recolor contract

The authored pink bathtub and shower-cap surfaces recolor together. The duck,
eyes, beak, blush, foam, and non-pink details remain protected by the original
texture.

The foam cleanup mask adds a softly shaded warm-white correction over authored
foam islands, covering color pollution baked into the source texture without
flattening the bubble lighting.

## Rebuild

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-duck/model-source-v001.glb `
  public/models/toys/color-duck/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

python scripts/3d/build-color-duck-mask-v003.py
python scripts/3d/build-color-duck-foam-cleanup-mask-v001.py
```

## Rollback

The source GLB above is the authoritative rollback input. Rebuild the runtime
and mask from it; do not edit or overwrite the source file.
