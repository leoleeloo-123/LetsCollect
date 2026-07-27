# Color Hamster Icecream Asset Notes

- Source: `model-source-v001.glb`
- Source size: 55,238,596 bytes
- Runtime: `public/models/toys/color-hamster-icecream/model-mobile-v001.glb`
- Runtime size: 231,128 bytes
- Runtime geometry: 59,974 triangles / 36,019 uploaded vertices
- Runtime textures: 1024 x 1024 WebP
- Compression: Draco
- Color mask: `public/models/toys/color-hamster-icecream/icecream-mask-mobile-v001.webp`
- Mask size: 14,680 bytes

The source model intentionally marks the ice-cream surface in saturated red.
The Lab combines that texture-space mask with the ice cream's model-space
bounds so only the ice cream changes color.

Rebuild the mask with:

```powershell
python scripts/3d/build-color-hamster-icecream-mask-v001.py
```
