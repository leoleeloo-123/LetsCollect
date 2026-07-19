# Color Teddy source notes

- Imported: 2026-07-19
- Original filename: `color-teddy.glb`
- Source asset: `model-source-v001.glb`
- Original size: 70,425,152 bytes
- Generator: THREE.GLTFExporter r178
- Source structure: one mesh, one material, no animation
- Source geometry: 1,999,558 triangles / 1,011,150 uploaded vertices
- Source textures: 4096x4096 base color PNG and 4096x4096 metallic-roughness PNG
- Design reference: user-provided seated teddy image dated 2026-07-19
- Protected color regions: both eyes, the light muzzle patch, nose and mouth, and both cheek blush patches
- Colorable region: the remaining teddy coat, including head, ears, torso, arms, and legs

## Runtime assets

- Mobile model: `public/models/toys/color-teddy/model-mobile-v001.glb`
- Protection mask: `public/models/toys/color-teddy/protect-mask-mobile-v001.webp`
- Mobile model size: 356,132 bytes
- Mobile geometry: 59,986 triangles / 36,149 uploaded vertices
- Mobile textures: two 1024x1024 WebP textures
- Runtime extensions: `KHR_draco_mesh_compression`, `EXT_texture_webp`
- Protection mask size: 7,404 bytes at 1024x1024, lossless WebP
- Protection channels: red = eyes/nose/mouth, green = both cheek blush patches, blue = fixed cream muzzle

## Rebuild settings

The active mobile model was generated with glTF Transform 4.4.1 using a 3% geometry target, 0.003 simplification error, Draco compression, and 1024px WebP textures:

```powershell
pnpm dlx @gltf-transform/cli optimize assets/models/source/color-teddy/model-source-v001.glb public/models/toys/color-teddy/model-mobile-v001.glb --compress draco --simplify-ratio 0.03 --simplify-error 0.003 --texture-size 1024 --texture-compress webp --palette false
```

Rebuild the protection mask after replacing or recompressing the runtime GLB:

```powershell
python scripts/3d/build-color-teddy-mask-v001.py
```

The source GLB is archival input. Runtime pages must load the optimized model only.
