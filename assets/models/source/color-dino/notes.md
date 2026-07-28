# Color Dino Asset Notes

- Source: `model-source-v001.glb`
- Source size: 59,292,476 bytes
- Runtime: `public/models/toys/color-dino/model-mobile-v001.glb`
- Runtime size: 255,936 bytes
- Runtime geometry: 59,946 triangles / 35,677 uploaded vertices
- Runtime textures: 1024 x 1024 WebP
- Compression: Draco
- Color mask: `public/models/toys/color-dino/scarf-mask-mobile-v001.webp`
- Mask size: 14,264 bytes

The Lab combines the source model's saturated red scarf pixels with the scarf's
model-space neck bounds so only the scarf changes color.

Rebuild the mask with:

```powershell
python scripts/3d/build-color-dino-mask-v001.py
```
