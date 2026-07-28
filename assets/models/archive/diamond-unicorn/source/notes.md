# Diamond Unicorn special-exhibit asset

- Source: `public/models/toys/jelly-jade-unicorn/model-web-v001.glb`
- Source size: 2,349,356 bytes
- Source geometry: 999,936 triangles
- Runtime: `public/models/toys/diamond-unicorn/model-mobile-v001.glb`
- Runtime size: 174,984 bytes
- Runtime geometry: 53,522 triangles, 33,406 vertices
- Compression: Draco
- Textures: none

The runtime GLB is a neutral, optimized derivative of the earliest Unicorn model. Its five diamond colors and physical-material treatment are applied at runtime by `src/three/material/createDiamondUnicornMaterial.ts`, which is shared by the product viewer and Diamond Unicorn Lab.

Product rules:

- Diamond Unicorn is a special exhibit with a 5% draw probability.
- It does not appear in the six-model home showcase.
- It does not count toward the normal six-model or nine-color Color Animals atlas.
- A drawn exhibit persists in the collection and supports reveal, thumbnail, and 3D detail views.
- Available colors are clear, ice blue, rose, champagne, and mint diamond.

Compression command:

```powershell
pnpm dlx @gltf-transform/cli optimize `
  public/models/toys/jelly-jade-unicorn/model-web-v001.glb `
  public/models/toys/diamond-unicorn/model-mobile-v001.glb `
  --compress draco `
  --texture-compress false `
  --palette false `
  --simplify true `
  --simplify-error 0.0005 `
  --simplify-ratio 0.05
```
