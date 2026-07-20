from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


SCRIPT = Path(__file__).with_name("build-color-cat-mask-v002.py")
SPEC = spec_from_file_location("color_cat_mask_v002", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_builder = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_builder)

# Keep the pink search close to the authored cheeks and nose. The broader v002
# regions caught pale face texels around UV seams and created visible strips.
FACE_PINK_RECTS = (
    (0.430, 0.195, 0.575, 0.290),
    (0.075, 0.450, 0.260, 0.555),
    (0.415, 0.515, 0.620, 0.635),
    (0.675, 0.475, 0.785, 0.600),
)


def build_mask() -> Image.Image:
    base = mask_builder.read_base_texture().resize(
        (mask_builder.MASK_SIZE, mask_builder.MASK_SIZE),
        Image.Resampling.LANCZOS,
    )
    ear = Image.new("L", base.size, 0)
    pink = Image.new("L", base.size, 0)
    dark = Image.new("L", base.size, 0)
    source = base.load()
    ear_target = ear.load()
    pink_target = pink.load()
    dark_target = dark.load()

    for y in range(mask_builder.MASK_SIZE):
        v = y / (mask_builder.MASK_SIZE - 1)
        for x in range(mask_builder.MASK_SIZE):
            u = x / (mask_builder.MASK_SIZE - 1)
            red, green, blue = source[x, y]
            luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue

            is_ear = mask_builder.inside(u, v, mask_builder.EAR_RECTS)
            if is_ear and red > 155 and blue > 82:
                red_bias = max(0.0, min(1.0, (red - green - 10.0) / 28.0))
                pink_bias = max(0.0, min(1.0, (34.0 - (green - blue)) / 36.0))
                ear_target[x, y] = round(255 * red_bias * pink_bias)

            if mask_builder.inside(u, v, FACE_PINK_RECTS) and red > 170 and blue > 92:
                red_bias = max(0.0, min(1.0, (red - green - 42.0) / 25.0))
                pink_bias = max(0.0, min(1.0, (30.0 - (green - blue)) / 16.0))
                pink_target[x, y] = round(255 * red_bias * pink_bias)

            dark_brown = red - green > 9 and green - blue > 3
            if mask_builder.inside(u, v, mask_builder.DARK_RECTS) and 7 < luma < 148 and dark_brown:
                dark_target[x, y] = 255

    ear = ear.point(lambda value: 255 if value >= 28 else 0)
    ear = ear.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41))
    ear = ear.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    pink = pink.point(lambda value: min(255, round(value * 1.7)))
    pink = pink.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    pink = pink.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.5))
    dark = dark.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
    fixed = ImageChops.lighter(ImageChops.lighter(ear, pink), dark)
    empty = Image.new("L", fixed.size, 0)
    return Image.merge("RGB", (fixed, empty, empty))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
