# Color Bunny source notes

- Imported: 2026-07-19
- Original filename: `color-bunny.glb`
- Source asset: `model-source-v001.glb`
- Original size: 69,481,016 bytes
- Generator: THREE.GLTFExporter r178
- Source structure: one mesh, one material, no animation
- Source geometry: 1,997,720 triangles / 1,013,670 uploaded vertices
- Source textures: two 4096x4096 PNG textures
- Design reference: user-provided white bunny with a small suitcase, dated 2026-07-19
- Fixed regions: white bunny body, eyes, nose, mouth, inner-ear pink, and cheek blush
- Colorable region: suitcase body and handle only

## Runtime assets

- Mobile model: `public/models/toys/color-bunny/model-mobile-v001.glb`
- Protection mask: `public/models/toys/color-bunny/protect-mask-mobile-v001.webp`
- Mobile model size: 376,784 bytes
- Protection mask size: 52,372 bytes (512x512 WebP)
- Mobile geometry: 59,930 triangles / 37,975 uploaded vertices
- Mobile textures: two 1024x1024 WebP textures
- Runtime extensions: `KHR_draco_mesh_compression`, `EXT_texture_webp`
- Protection channels: red = warm pink candidates, green = dark fixed details, blue = unused

## Rebuild settings

```powershell
pnpm dlx @gltf-transform/cli optimize assets/models/source/color-bunny/model-source-v001.glb public/models/toys/color-bunny/model-mobile-v001.glb --compress draco --simplify-ratio 0.03 --simplify-error 0.003 --texture-size 1024 --texture-compress webp --palette false
```

```powershell
python scripts/3d/build-color-bunny-mask-v001.py
```

The source GLB is archival input. Runtime pages must load the optimized model only.
