# Color Owl source notes

- Imported: 2026-07-27
- Original delivered filename: `color-owl.glb`
- Canonical source: `model-source-v001.glb`
- Source size: 81,062,676 bytes
- Source SHA-256: `0EB6EBE01391C9365E166B3FBC8C11FA161E59A18D4D5A6C1345B43AED108DE7`
- Source geometry: one mesh, one primitive, 1,999,082 triangles
- Source materials: one PBR material
- Source textures: 4096 × 4096 base-color PNG and 4096 × 4096 metallic-roughness PNG

## Runtime

- Active experimental runtime: `public/models/toys/color-owl/model-mobile-v001.glb`
- Runtime size: 323,444 bytes
- Runtime geometry: 59,970 triangles
- Runtime textures: 1024 × 1024 WebP base color and metallic-roughness
- Academic mask: `public/models/toys/color-owl/hat-book-mask-mobile-v001.webp`
- Academic mask size: 33,208 bytes, 1024 × 1024 lossless WebP
- Lab route: `/color-owl-lab`

This runtime is an internal experimental Lab asset. It is not active in the
product catalog or draw pool.

## Recolor contract

The purple doctoral cap and purple book-cover surfaces recolor together. The
owl feathers, eyes, beak, feet, book pages, and gold cover decoration remain
protected by the original texture.

The mask builder selects only authored purple texels. Gold decoration is
excluded because its blue channel stays below green, while the purple surfaces
keep blue above green across their shaded UV islands.

## Rebuild

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-owl/model-source-v001.glb `
  public/models/toys/color-owl/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

python scripts/3d/build-color-owl-mask-v001.py
```

## Rollback

The source GLB above is the authoritative rollback input. Rebuild the runtime
and mask from it; do not edit or overwrite the source file.
