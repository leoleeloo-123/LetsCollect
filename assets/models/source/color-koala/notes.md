# Color Koala

## Source

- Imported: 2026-07-24
- Original file: `color-koala.glb`
- Archived source: `model-source-v001.glb`
- SHA-256: `077F1880018F85F6F03A5F397B127305E471580E88FF3E173698A3426651AFFE`
- Source size: 81,806,600 bytes
- Source geometry: 1,998,570 triangles; 1,013,116 uploaded vertices
- Source textures: two embedded 4096 x 4096 PNG textures

## Runtime asset

- File: `public/models/toys/color-koala/model-mobile-v001.glb`
- Size: 335,136 bytes
- Geometry: 59,956 triangles; 36,723 uploaded vertices
- Compression: Draco geometry, 1024px WebP textures
- Runtime extensions: `KHR_draco_mesh_compression`, `EXT_texture_webp`

## Color behavior

- Fixed: koala, face, top pom-pom, branch, leaves, and all other props
- Colorable: the original lavender sleeping-hat body only
- Mask: `public/models/toys/color-koala/hat-mask-mobile-v001.webp`
- Mask size: 9,014 bytes (512 x 512 WebP)
- The mask is generated from the optimized base-color texture by
  `scripts/3d/build-color-koala-mask-v001.py`; a targeted right-ear UV cutout plus the local hat-height gate keeps non-hat regions protected.

## Rebuild commands

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-koala/model-source-v001.glb `
  public/models/toys/color-koala/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false
```

```powershell
python scripts/3d/build-color-koala-mask-v001.py
```

The source GLB is archival input. Runtime pages must load the optimized model only.
