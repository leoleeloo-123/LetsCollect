from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


SCRIPT = Path(__file__).with_name("build-color-bird-mask-v003.py")
SPEC = spec_from_file_location("color_bird_mask_v003", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v003 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v003)
mask_builder = mask_v003.mask_builder
mask_builder.OUTPUT = mask_builder.RUNTIME_DIR / "protect-mask-mobile-v004.webp"
HEAD_ZONE = mask_builder.ROOT / "assets" / "models" / "archive" / "color-bird" / "masks" / "head-zone-v001.webp"
build_v003 = mask_builder.build_mask


def build_mask() -> Image.Image:
    fixed, _, blush = build_v003().split()
    head = Image.open(HEAD_ZONE).convert("L")
    head = ImageChops.multiply(head, ImageOps.invert(ImageChops.lighter(fixed, blush)))
    return Image.merge("RGB", (fixed, head, blush))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
