from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter, ImageOps


SCRIPT = Path(__file__).with_name("build-color-bird-mask-v002.py")
SPEC = spec_from_file_location("color_bird_mask_v002", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v002 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v002)
mask_builder = mask_v002.mask_builder
mask_builder.OUTPUT = mask_builder.RUNTIME_DIR / "protect-mask-mobile-v003.webp"

EYE_CENTERS = ((0.078, 0.268), (0.705, 0.303))
FEATURE_CENTERS = (
    (0.802, 0.322),
    (0.786, 0.437),
    (0.358, 0.497),
    (0.546, 0.593),
    (0.530, 0.451),
    (0.515, 0.516),
    (0.818, 0.898),
)
BLUSH_CENTERS = (
    (0.118, 0.327),
    (0.625, 0.122),
    (0.817, 0.358),
)


def keep_components(mask: Image.Image, centers: tuple[tuple[float, float], ...], radius: float) -> Image.Image:
    width, height = mask.size
    source = mask.load()
    seen = bytearray(width * height)
    output = Image.new("L", mask.size, 0)
    target = output.load()

    for start in range(width * height):
        x0, y0 = start % width, start // width
        if seen[start] or source[x0, y0] == 0:
            continue
        stack = [start]
        seen[start] = 1
        component: list[int] = []
        while stack:
            current = stack.pop()
            component.append(current)
            x, y = current % width, current // width
            for neighbor in (
                current - 1 if x else -1,
                current + 1 if x < width - 1 else -1,
                current - width if y else -1,
                current + width if y < height - 1 else -1,
            ):
                if neighbor < 0 or seen[neighbor]:
                    continue
                nx, ny = neighbor % width, neighbor // width
                if source[nx, ny] == 0:
                    continue
                seen[neighbor] = 1
                stack.append(neighbor)

        center_x = sum(index % width for index in component) / len(component) / (width - 1)
        center_y = sum(index // width for index in component) / len(component) / (height - 1)
        keep_component = len(component) >= 100 and any(
            (center_x - target_x) ** 2 + (center_y - target_y) ** 2 < radius ** 2
            for target_x, target_y in centers
        )
        if keep_component:
            for index in component:
                target[index % width, index // width] = 255
    return output


def build_mask() -> Image.Image:
    size = mask_builder.MASK_SIZE
    base = mask_builder.read_base_texture().resize((size, size), Image.Resampling.LANCZOS)
    fixed_features = Image.new("L", base.size, 0)
    eye_pixels = Image.new("L", base.size, 0)
    head = Image.new("L", base.size, 0)
    blush = Image.new("L", base.size, 0)
    source = base.load()
    fixed_target = fixed_features.load()
    eye_target = eye_pixels.load()
    head_target = head.load()
    blush_target = blush.load()

    for y in range(size):
        v = y / (size - 1)
        for x in range(size):
            u = x / (size - 1)
            red, green, blue = source[x, y]
            warmth = mask_builder.warm_score(red, green, blue)
            if mask_builder.inside(u, v, mask_builder.EYE_RECTS) and max(red, green, blue) < 105:
                eye_target[x, y] = 255

            beak = mask_builder.inside(u, v, mask_builder.BEAK_RECTS) and red > 115 and red - green > 18 and green - blue > 42
            feet = mask_builder.inside(u, v, mask_builder.FOOT_RECTS) and red > 90 and red - green > 20 and green - blue > 22
            if beak or feet:
                fixed_target[x, y] = 255

            blush_value = warmth if mask_builder.inside(u, v, mask_builder.BLUSH_RECTS) else 0
            blush_target[x, y] = blush_value
            head_target[x, y] = round(warmth * (1.0 - blush_value / 255.0))

    blush = keep_components(blush, BLUSH_CENTERS, 0.055)
    eyes = keep_components(eye_pixels, EYE_CENTERS, 0.035)
    eyes = eyes.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    eyes = eyes.filter(ImageFilter.MaxFilter(3))
    features = keep_components(fixed_features, FEATURE_CENTERS, 0.06)
    fixed = ImageChops.lighter(features, eyes).filter(ImageFilter.MaxFilter(3))
    fixed = fixed.filter(ImageFilter.GaussianBlur(0.75))
    blush = blush.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    protected_or_blush = ImageChops.lighter(fixed, blush)
    head = ImageChops.multiply(head, ImageOps.invert(protected_or_blush))
    head = head.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    return Image.merge("RGB", (fixed, head, blush))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
