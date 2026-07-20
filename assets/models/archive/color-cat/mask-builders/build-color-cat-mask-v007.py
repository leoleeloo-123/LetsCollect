from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


SCRIPT = Path(__file__).with_name("build-color-cat-mask-v006.py")
SPEC = spec_from_file_location("color_cat_mask_v006", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v006 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v006)
mask_builder = mask_v006.mask_builder
build_v006 = mask_builder.build_mask


def build_mask() -> Image.Image:
    fixed, _, _ = build_v006().split()
    base = mask_builder.read_base_texture().resize(
        (mask_builder.MASK_SIZE, mask_builder.MASK_SIZE),
        Image.Resampling.LANCZOS,
    )
    pink = Image.new("L", base.size, 0)
    source = base.load()
    target = pink.load()

    # Inner-ear geometry is split across more UV fragments than the original
    # four hand-authored rectangles. Detect authored pink across the complete
    # atlas; the shader's ear/face position gates keep body UV reuse excluded.
    for y in range(mask_builder.MASK_SIZE):
        for x in range(mask_builder.MASK_SIZE):
            red, green, blue = source[x, y]
            if red <= 155 or blue <= 82:
                continue
            red_bias = max(0.0, min(1.0, (red - green - 10.0) / 28.0))
            pink_bias = max(0.0, min(1.0, (34.0 - (green - blue)) / 36.0))
            target[x, y] = round(255 * red_bias * pink_bias)

    pink = pink.point(lambda value: 255 if value >= 28 else 0)
    pink = pink.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))
    pink = pink.filter(ImageFilter.GaussianBlur(1.0))

    ear_patch = Image.new("L", fixed.size, 0)
    left, top, right, bottom = mask_builder.EAR_RECTS[2]
    ImageDraw.Draw(ear_patch).rectangle(
        (
            round(left * (mask_builder.MASK_SIZE - 1)),
            round(top * (mask_builder.MASK_SIZE - 1)),
            round(right * (mask_builder.MASK_SIZE - 1)),
            round(bottom * (mask_builder.MASK_SIZE - 1)),
        ),
        fill=255,
    )
    ear_patch = ear_patch.filter(ImageFilter.GaussianBlur(0.8))
    return Image.merge("RGB", (fixed, pink, ear_patch))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
