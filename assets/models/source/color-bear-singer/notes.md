# Color Bear Singer

## Source

- Imported: 2026-07-24
- Original file: `color-bear-singer.glb`
- Archived source: `model-source-v001.glb`
- Source size: 82,404,276 bytes
- Source geometry: 1,994,030 triangles; 1,010,302 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- Active file: `public/models/toys/color-bear-singer/model-mobile-v006.glb`
- Rollback file: `public/models/toys/color-bear-singer/model-mobile-v001.glb`
- Active size: 1,375,744 bytes
- Active geometry: 199,402 triangles; 109,551 uploaded vertices
- Compression: Draco geometry, 4096px WebP textures

## Color behavior

- Fixed: bear body, face, eyes, nose, mouth, clothing, and stage accessories
- Colorable: the dark curled afro at the top of the model
- Mask: `afro-mask-mobile-v001.webp`, 11,540 bytes
- Selection combines retained large dark UV islands with a front/back-aware object-space
  hair boundary. The shader restores the authored skin color below that boundary, removing
  forehead and ear curl intersections that are already present in the source GLB.

## Build command

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-bear-singer/model-source-v001.glb `
  public/models/toys/color-bear-singer/model-mobile-v006.glb `
  --compress draco `
  --simplify-ratio 0.10 `
  --simplify-error 0.001 `
  --simplify-lock-border true `
  --texture-size 4096 `
  --texture-compress webp `
  --palette false
```
