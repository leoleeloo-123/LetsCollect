# Color Cat v002

- Active source: `assets/models/source/color-cat/model-source-v002.glb` (72,839,848 bytes; local only and Git-ignored)
- Active runtime: `public/models/toys/color-cat/model-mobile-v002.glb` (656,900 bytes)
- Runtime target: only the yarn ball and loose strand change color
- Retired v001 source, runtime, mask, builders, and production code: `assets/models/archive/color-cat/`

## Geometry split

The source GLB contains one mesh, one material, 1,016,609 upload vertices, and
1,999,914 triangles. The yarn is not named separately, but it is made from 24
disconnected topology components on the positive-X side of the model.

`scripts/3d/build-color-cat-model-v002.mjs` finds connected components, selects
the yarn ball and loose strand by seed coordinates, and writes two primitives:

- `color_cat_new_body`
- `color_cat_new_yarn`

Production and the Lab recolor only `color_cat_new_yarn`; no screen-space
overlay, UV protection mask, or extra mask request is used. The optimized runtime
contains about 80,000 triangles and two 1024 px WebP textures.

## Rebuild

```powershell
node scripts/3d/build-color-cat-model-v002.mjs
pnpm dlx @gltf-transform/cli optimize color-cat-split-v002.glb public/models/toys/color-cat/model-mobile-v002.glb --compress draco --texture-compress webp --texture-size 1024 --palette false --simplify true --simplify-error 0.0005 --simplify-ratio 0.04
```

The intermediate `color-cat-split-v002.glb` is a local rebuild artifact and
should not be committed.
