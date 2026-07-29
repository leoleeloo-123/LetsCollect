# Color Bird v002 source

## Intake

- Imported: 2026-07-29
- Original filename: `color-bird-new.glb`
- Canonical source: `model-source-v002.glb`
- Source size: 74,691,460 bytes
- Source SHA-256: `39B25832F5E5E1F7953659E3FE0C1AEC586239F6149E5844FC53019C0AB1748B`
- Source geometry: one mesh, one primitive, 1,998,622 triangles and 1,011,342 uploaded vertices
- Source material: one PBR material
- Source textures: embedded 4096 × 4096 base-color PNG and 4096 × 4096 metallic-roughness PNG

## Active runtime

- Runtime: `public/models/toys/color-bird/model-mobile-v002.glb`
- Runtime size: 295,428 bytes
- Runtime geometry: 59,958 triangles and 36,186 uploaded vertices
- Runtime compression: Draco geometry and two 1024 × 1024 WebP textures
- Crown mask: `public/models/toys/color-bird/crown-mask-mobile-v001.webp`
- Crown mask size: 4,292 bytes, 1024 × 1024 lossless WebP
- Crown topology: `public/models/toys/color-bird/crown-triangle-mask-mobile-v001.bin`
- Topology size: 59,958 bytes, one encoded byte per runtime triangle for exact crown faces plus shared-edge and proximity feather flags
- Lab route: `/color-bird-lab`

## Color behavior

- Colorable: only the gold crown, including the crown band, points, and top spheres
- Fixed: head, body, wings, tail, eyes, beak, blush, feet, and every other authored detail
- Isolation: height and face direction separate exact crown faces from upward-facing head faces. Shared-edge fragments additionally require a high-chroma, low-blue original crown texture signal, preventing pale head pixels from recoloring while still catching deep orange crown shadows; 0.020-unit proximity flags remain restricted to the left edge that needs extra coverage.
- Rendering mode: standard `color-accessory-mask` profile `bird-crown`

## Rebuild

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-bird/model-source-v002.glb `
  public/models/toys/color-bird/model-mobile-v002.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false

pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-bird/model-mobile-v002.glb `
  C:/tmp/color-bird-new-inspect-20260729-v2/model.gltf

python scripts/3d/build-color-bird-crown-mask-v001.py `
  --unpacked C:/tmp/color-bird-new-inspect-20260729-v2
```

## Rollback

The retired full-body Color Bird implementation is preserved under
`assets/models/archive/color-bird/`, including source v001, runtime v001,
protect-mask v014, builder history, and the former Lab/production shader code.
