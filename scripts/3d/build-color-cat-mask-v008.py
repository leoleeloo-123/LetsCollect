import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE_MODEL = ROOT / "assets" / "models" / "source" / "color-cat" / "model-source-v001.glb"
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-cat"
OUTPUT = RUNTIME_DIR / "protect-mask-mobile-v001.webp"
MASK_SIZE = 1024

EAR_RECTS = (
    (0.245, 0.075, 0.290, 0.130),
    (0.445, 0.095, 0.565, 0.185),
    (0.765, 0.300, 0.860, 0.380),
    (0.940, 0.055, 1.000, 0.145),
)
FACE_PINK_RECTS = (
    (0.430, 0.195, 0.575, 0.290),
    (0.075, 0.450, 0.260, 0.555),
    (0.415, 0.515, 0.620, 0.635),
    (0.675, 0.475, 0.785, 0.600),
)
DARK_RECTS = (
    (0.445, 0.180, 0.507, 0.218),
    (0.528, 0.212, 0.570, 0.258),
    (0.498, 0.238, 0.562, 0.288),
    (0.082, 0.462, 0.133, 0.545),
    (0.145, 0.505, 0.225, 0.558),
    (0.232, 0.478, 0.258, 0.525),
    (0.686, 0.482, 0.757, 0.550),
    (0.503, 0.588, 0.522, 0.615),
)


def read_base_texture() -> Image.Image:
    with SOURCE_MODEL.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {SOURCE_MODEL}")
        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {SOURCE_MODEL}")
        document = json.loads(glb.read(json_length))
        binary_length, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {SOURCE_MODEL}")
        binary = glb.read(binary_length)

    material = document["materials"][0]
    texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    texture = document["textures"][texture_index]
    source_index = texture.get("extensions", {}).get(
        "EXT_texture_webp", {}
    ).get("source", texture.get("source"))
    if source_index is None:
        raise ValueError("Base-color texture has no image source")
    image = document["images"][source_index]
    view = document["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    return Image.open(io.BytesIO(binary[start : start + view["byteLength"]])).convert("RGB")


def inside(
    u: float,
    v: float,
    rectangles: tuple[tuple[float, float, float, float], ...],
) -> bool:
    return any(left <= u <= right and top <= v <= bottom for left, top, right, bottom in rectangles)


def build_fixed_channel(base: Image.Image) -> Image.Image:
    ear = Image.new("L", base.size, 0)
    pink = Image.new("L", base.size, 0)
    dark = Image.new("L", base.size, 0)
    source = base.load()
    ear_target = ear.load()
    pink_target = pink.load()
    dark_target = dark.load()

    for y in range(MASK_SIZE):
        v = y / (MASK_SIZE - 1)
        for x in range(MASK_SIZE):
            u = x / (MASK_SIZE - 1)
            red, green, blue = source[x, y]
            luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue

            is_ear = inside(u, v, EAR_RECTS)
            if is_ear and red > 155 and blue > 82:
                red_bias = max(0.0, min(1.0, (red - green - 10.0) / 28.0))
                pink_bias = max(0.0, min(1.0, (34.0 - (green - blue)) / 36.0))
                ear_target[x, y] = round(255 * red_bias * pink_bias)

            if inside(u, v, FACE_PINK_RECTS) and red > 170 and blue > 92:
                red_bias = max(0.0, min(1.0, (red - green - 42.0) / 25.0))
                pink_bias = max(0.0, min(1.0, (30.0 - (green - blue)) / 16.0))
                pink_target[x, y] = round(255 * red_bias * pink_bias)

            dark_brown = red - green > 9 and green - blue > 3
            if inside(u, v, DARK_RECTS) and 7 < luma < 148 and dark_brown:
                dark_target[x, y] = 255

    ear = ear.point(lambda value: 255 if value >= 28 else 0)
    ear = ear.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41))
    ear = ear.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    pink = pink.point(lambda value: min(255, round(value * 1.7)))
    pink = pink.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    pink = pink.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.5))
    dark = dark.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
    fixed = ImageChops.lighter(ImageChops.lighter(ear, pink), dark)

    island = Image.new("L", base.size, 0)
    island_source = base.load()
    island_target = island.load()
    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            island_target[x, y] = 255 if max(island_source[x, y]) > 18 else 0
    island = island.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.MinFilter(7))
    return ImageChops.multiply(fixed, island)


def build_supplement_channels(base: Image.Image) -> tuple[Image.Image, Image.Image]:
    pink = Image.new("L", base.size, 0)
    source = base.load()
    target = pink.load()
    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            if red <= 155 or blue <= 82:
                continue
            red_bias = max(0.0, min(1.0, (red - green - 10.0) / 28.0))
            pink_bias = max(0.0, min(1.0, (34.0 - (green - blue)) / 36.0))
            target[x, y] = round(255 * red_bias * pink_bias)
    pink = pink.point(lambda value: 255 if value >= 28 else 0)
    pink = pink.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))
    pink = pink.filter(ImageFilter.GaussianBlur(1.0))

    ear_patch = Image.new("L", base.size, 0)
    left, top, right, bottom = EAR_RECTS[2]
    ImageDraw.Draw(ear_patch).rectangle(
        (
            round(left * (MASK_SIZE - 1)),
            round(top * (MASK_SIZE - 1)),
            round(right * (MASK_SIZE - 1)),
            round(bottom * (MASK_SIZE - 1)),
        ),
        fill=255,
    )
    return pink, ear_patch.filter(ImageFilter.GaussianBlur(0.8))


def build_mask() -> Image.Image:
    base = read_base_texture().resize((MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS)
    fixed = build_fixed_channel(base)
    pink, ear_patch = build_supplement_channels(base)
    return Image.merge("RGB", (fixed, pink, ear_patch))


def main() -> None:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
