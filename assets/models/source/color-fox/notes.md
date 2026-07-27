# Color Fox Asset Notes

- Source: `model-source-v001.glb`
- Source size: 57,907,204 bytes
- Runtime: `public/models/toys/color-fox/model-mobile-v001.glb`
- Runtime size: 247,540 bytes
- Runtime geometry: 59,938 triangles / 35,955 uploaded vertices
- Runtime textures: 1024 x 1024 WebP
- Compression: Draco
- Color mask: `public/models/toys/color-fox/hat-feather-mask-mobile-v001.webp`
- Mask size: 50,634 bytes

The Lab combines the hat and red-feather texture candidates with their
model-space bounds so the hat and feather change color together.

Rebuild the mask with:

```powershell
python scripts/3d/build-color-fox-mask-v001.py
```
