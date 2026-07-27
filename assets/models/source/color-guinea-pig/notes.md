# Color Guinea Pig source notes

- Imported: 2026-07-27
- Original delivered filename: `color-guinea-pig.glb`
- Canonical source: `model-source-v001.glb`
- Source size: 78,620,492 bytes
- Source SHA-256: `13A232012B4A0FB5B0FAF561ABA5A69C8067C5CAABD1437A71EF1F3FB1371F51`
- Source geometry: one mesh, one primitive, 1,996,170 triangles
- Source materials: one PBR material
- Source textures: 4096 × 4096 base-color PNG and 4096 × 4096 metallic-roughness PNG

## Runtime

- Active experimental runtime: `public/models/toys/color-guinea-pig/model-mobile-v001.glb`
- Runtime size: 309,868 bytes
- Runtime geometry: 59,884 triangles, 37,109 vertices
- Runtime textures: 1024 × 1024 WebP base color and metallic-roughness
- Balloon coverage mask: `public/models/toys/color-guinea-pig/balloon-zones-mobile-v003.webp` (23,128 bytes, 1024 × 1024 lossless WebP)
- Lab route: `/color-guinea-pig-lab`

This runtime is an internal experimental Lab asset. It is not active in the
product catalog or draw pool.

## Recolor contract

The star, heart, and round balloons receive the same randomly selected color.
Using one shared color removes visible cross-color seams where the generated
geometry and UV regions intersect. The guinea pig, ears, paws, facial details,
and balloon strings remain protected by the original texture.

The Lab expands the optimized mesh to triangle-local vertices. Local position,
surface normal, and fitted ellipsoid scores identify the balloon union, while
the repaired UV coverage mask protects the guinea pig and strings. Zone identity
is retained only for coverage; all balloon zones now consume the same color.
The star string has an explicit lower-position protection cutoff, while the
heart/round lower bound includes the round balloon's tied root without reaching
the guinea pig.

## Rebuild

```powershell
pnpm dlx @gltf-transform/cli optimize `
  assets/models/source/color-guinea-pig/model-source-v001.glb `
  public/models/toys/color-guinea-pig/model-mobile-v001.glb `
  --compress draco `
  --simplify-ratio 0.03 `
  --simplify-error 0.003 `
  --texture-size 1024 `
  --texture-compress webp `
  --palette false
```

```powershell
python scripts/3d/build-color-guinea-pig-balloon-mask-v002.py
```

```powershell
pnpm dlx @gltf-transform/cli copy `
  public/models/toys/color-guinea-pig/model-mobile-v001.glb `
  C:/tmp/color-guinea-pig-inspect/model.gltf

python scripts/3d/build-color-guinea-pig-balloon-mask-v003.py `
  --unpacked C:/tmp/color-guinea-pig-inspect
```

## Rollback

The source GLB above is the authoritative rollback input. Rebuild the runtime
from it; do not edit or overwrite the source file.
