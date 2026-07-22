# Color Otter source notes

- Source asset: `model-source-v001.glb`
- Original drop copy: `model-original-drop.glb` (byte-identical, retained for provenance)
- Runtime asset: `public/models/toys/color-otter/model-mobile-v008.glb`
- Experimental backup: `public/models/toys/color-otter/model-mobile-v024.glb`
- Stable backups: `public/models/toys/color-otter/model-mobile-v007.glb`, `assets/models/archive/color-otter/runtime-history/model-mobile-v006.glb`, `model-mobile-v005.glb`, and `model-mobile-v004.glb`
- Source size: 70,976,028 bytes
- Runtime size: 359,492 bytes
- Source geometry: 2,000,116 triangles
- Runtime geometry: 60,414 triangles
- Runtime vertices: 37,274
- Runtime textures: two 1024px WebP images
- Runtime compression: Draco
- Runtime materials: `Otter_Base`, `Lollipop_Color`

The source stores the candy shell, its lower cap, and adjacent character surfaces in a small number of connected components. Version 008 expands the clipped primary contact patch while retaining its `y=0.310` top cap and the exclusion of five coarse legacy front fills. Original source vertices and the main candy shell remain unchanged. Version 024 is retained as an inactive experiment and is not loaded by the product.

The Lab changes the PBR material directly. It does not use a shader mask,
screen-space projection, dynamic overlay, or replacement sphere. Version 007
remains available as the immediate stable rollback asset.

Rebuild flow:

```powershell
pnpm dlx @gltf-transform/cli copy assets/models/archive/color-otter/runtime-history/model-mobile-v001.glb color-otter-uncompressed.glb --vertex-layout separate
python scripts/3d/build-color-otter-model-v008.py color-otter-uncompressed.glb color-otter-split-v008.glb
pnpm dlx @gltf-transform/cli optimize color-otter-split-v008.glb public/models/toys/color-otter/model-mobile-v008.glb --compress draco --texture-compress webp --texture-size 1024 --palette false --simplify false
```