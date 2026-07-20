# Color Panda source notes

- Imported: 2026-07-20
- Original filename: `color-panda.glb`
- Source asset: `model-source-v001.glb`
- Original size: 75,009,800 bytes
- Generator: THREE.GLTFExporter r178
- Source structure: one mesh, one material, no animation
- Source geometry: 2,000,014 triangles / 1,015,953 uploaded vertices
- Source textures: two 4096x4096 PNG textures
- Fixed regions: panda body, black-and-white markings, eyes, nose, mouth, and blush
- Colorable region: headwear only

## Runtime assets

- Mobile model: `public/models/toys/color-panda/model-mobile-v001.glb`
- Hat mask: `public/models/toys/color-panda/hat-mask-mobile-v001.webp`
- Hat mask size: 6,024 bytes (512x512 WebP)
- Mobile model size: 415,160 bytes
- Mobile geometry: 60,000 triangles / 37,946 uploaded vertices
- Mobile textures: two 1024x1024 WebP textures
- Runtime extensions: `KHR_draco_mesh_compression`, `EXT_texture_webp`
- Mask channels: red = blue headwear candidates, green/blue = unused

## Rebuild settings

```powershell
pnpm dlx @gltf-transform/cli optimize assets/models/source/color-panda/model-source-v001.glb public/models/toys/color-panda/model-mobile-v001.glb --compress draco --simplify-ratio 0.03 --simplify-error 0.003 --texture-size 1024 --texture-compress webp --palette false
```

```powershell
python scripts/3d/build-color-panda-mask-v001.py
```

The source GLB is archival input. Runtime pages must load the optimized model only.