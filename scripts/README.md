# Scripts

Scripts for model optimization, mask generation, thumbnail generation, asset validation, and deployment checks live here.

Do not commit temporary optimization outputs. See `.gitignore`.

- `3d/build-color-dog-mask-v028.py`: rebuilds the active Color Dog protection mask from the archived v015 mask and the optimized mobile GLB.
- `3d/build-color-bird-crown-mask-v001.py`: rebuilds the active Color Bird v002 crown UV mask and topology-locked triangle mask from the unpacked optimized runtime; the retired full-body builders live under `assets/models/archive/color-bird/mask-builders/`.
- `3d/build-color-bunny-mask-v001.py`: rebuilds the Color Bunny warm-detail and fixed-dark mask used by the production bag-only material.
- `3d/build-color-panda-mask-v001.py`: rebuilds the Color Panda blue headwear mask used by the hat-only color lab.
- `3d/build-color-cat-mask-v008.py`: rebuilds the active Color Cat fixed-detail mask for the production geometry-gated material.
- `3d/build-color-guinea-pig-balloon-mask-v003.py`: repairs the active Color Guinea Pig balloon coverage mask from the optimized model UV islands.
- `3d/build-color-penguin-mask-v003.py`: rebuilds the active Color Penguin source-pink earmuff/cup texture mask and topology-zone triangle mask from the unpacked v003 runtime.

