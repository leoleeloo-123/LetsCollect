# Scripts

Scripts for model optimization, mask generation, thumbnail generation, asset validation, and deployment checks live here.

Do not commit temporary optimization outputs. See `.gitignore`.

- `3d/build-color-dog-mask-v028.py`: rebuilds the active Color Dog protection mask from the archived v015 mask and the optimized mobile GLB.
- `3d/build-color-bird-mask-v014.py`: rebuilds the active Color Bird body/cap/blush/fixed-detail mask; v001-v005 remain beside it as its import chain.
- `3d/build-color-teddy-mask-v001.py`: rebuilds the active Color Teddy protection mask.
- `3d/build-color-bunny-mask-v001.py`: rebuilds the Color Bunny warm-detail and fixed-dark mask used by the production bag-only material.
- `3d/build-color-panda-mask-v001.py`: rebuilds the Color Panda blue headwear mask used by the hat-only color lab.
- `3d/build-color-cat-mask-v008.py`: rebuilds the active Color Cat fixed-detail mask for the production geometry-gated material.

