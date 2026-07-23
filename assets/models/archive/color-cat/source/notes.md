# Color Cat asset notes

Status: validated and active in the Color Animals product catalog, home carousel, draw pool, collection, and atlas.

## Source

- Imported source: `model-source-v001.glb`
- Original filename: `color-cat.glb`
- Original size: 69,930,520 bytes
- Source geometry: 1,998,388 triangles
- Source textures: two 4096 x 4096 PNG images

## Mobile runtime

- Runtime model: `public/models/toys/color-cat/model-mobile-v001.glb`
- Optimization: Draco geometry, WebP textures, 1024 texture limit
- Simplification: 2.5% ratio, 0.003 error tolerance
- Runtime geometry: 49,958 triangles
- Runtime size after optimization: about 319 KB
- Runtime textures: two 1024 x 1024 WebP images

## Protection mask

- Runtime mask: `public/models/toys/color-cat/protect-mask-mobile-v001.webp`
- Active builder: `scripts/3d/build-color-cat-mask-v008.py`
- Red channel: fixed authored face and ear details
- Green channel: authored pink supplement
- Blue channel: inner-ear patch supplement
- Protected details: pink inner ears, pink nose, whiskers, closed eyes, mouth lines, and blush
- Colorizable area: the remaining coat, paws, and tail

The model is a single textured mesh and some inner-ear/facial UV fragments sit near coat atlas fragments. The Color Cat Lab material combines the red-channel mask with an object-space front-face/ear gate. This keeps all ear seams protected while preventing isolated mask texels from appearing on the body when the coat color changes.

## Validation

- Checked at high-contrast cyan coat color from the front and side.
- Confirmed the main inner-ear surfaces, nose, eyes, whiskers, mouth, and both blush areas remain authored colors.
- Confirmed the body, paws, and tail recolor uniformly under the active semantic geometry gate.
