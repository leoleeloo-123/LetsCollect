from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


SCRIPT = Path(__file__).with_name("build-color-cat-mask-v003.py")
SPEC = spec_from_file_location("color_cat_mask_v003", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v003 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v003)
mask_builder = mask_v003.mask_builder
build_v003 = mask_builder.build_mask


def build_mask() -> Image.Image:
    fixed, _, _ = build_v003().split()
    base = mask_builder.read_base_texture().resize(
        (mask_builder.MASK_SIZE, mask_builder.MASK_SIZE),
        Image.Resampling.LANCZOS,
    )
    island = Image.new("L", base.size, 0)
    source = base.load()
    target = island.load()
    for y in range(mask_builder.MASK_SIZE):
        for x in range(mask_builder.MASK_SIZE):
            target[x, y] = 255 if max(source[x, y]) > 18 else 0

    # Fill black facial strokes within each UV island, then inset the island a
    # few pixels. This removes mask texels sampled from the atlas background,
    # which otherwise show up as pale seams after the coat is recolored.
    island = island.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.MinFilter(7))
    fixed = ImageChops.multiply(fixed, island)
    empty = Image.new("L", fixed.size, 0)
    return Image.merge("RGB", (fixed, empty, empty))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
