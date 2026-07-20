import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE_MODEL = ROOT / "assets" / "models" / "source" / "color-cat" / "model-source-v001.glb"
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-cat"
OUTPUT = RUNTIME_DIR / "protect-mask-mobile-v001.webp"
MASK_SIZE = 1024

# The cat is a single textured mesh. Its facial details and inner ears are
# split across several UV islands, so these small atlas regions keep coat
# patches and baked body shadows out of the fixed-detail mask.
PINK_RECTS = (
    (0.245, 0.075, 0.290, 0.130),
    (0.445, 0.095, 0.565, 0.185),
    (0.765, 0.300, 0.860, 0.380),
    (0.940, 0.055, 1.000, 0.145),
    (0.425, 0.170, 0.575, 0.305),
    (0.040, 0.435, 0.265, 0.565),
    (0.390, 0.495, 0.695, 0.640),
    (0.650, 0.465, 0.800, 0.625),
)

DARK_RECTS = (
    # Screen-right closed eye, nose outline, and mouth.
    (0.435, 0.170, 0.510, 0.220),
    (0.500, 0.210, 0.575, 0.300),
    # Screen-left whiskers, closed eye, and the nose seam fragment.
    (0.070, 0.455, 0.140, 0.550),
    (0.135, 0.500, 0.240, 0.565),
    (0.225, 0.470, 0.265, 0.535),
    # Remaining whisker/eye islands on the right and lower face.
    (0.670, 0.465, 0.760, 0.565),
    (0.495, 0.575, 0.535, 0.625),
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
    source_index = texture.get("extensions", {}).get("EXT_texture_webp", {}).get("source", texture.get("source"))
    if source_index is None:
        raise ValueError("Base-color texture has no image source")
    image = document["images"][source_index]
    view = document["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    return Image.open(io.BytesIO(binary[start : start + view["byteLength"]])).convert("RGB")


def inside(u: float, v: float, rectangles: tuple[tuple[float, float, float, float], ...]) -> bool:
    return any(left <= u <= right and top <= v <= bottom for left, top, right, bottom in rectangles)


def build_mask() -> Image.Image:
    base = read_base_texture().resize((MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS)
    pink = Image.new("L", base.size, 0)
    dark = Image.new("L", base.size, 0)
    source = base.load()
    pink_target = pink.load()
    dark_target = dark.load()

    for y in range(MASK_SIZE):
        v = y / (MASK_SIZE - 1)
        for x in range(MASK_SIZE):
            u = x / (MASK_SIZE - 1)
            red, green, blue = source[x, y]
            luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue

            if inside(u, v, PINK_RECTS) and red > 165 and blue > 90:
                red_bias = max(0.0, min(1.0, (red - green - 18.0) / 30.0))
                pink_bias = max(0.0, min(1.0, (24.0 - (green - blue)) / 28.0))
                pink_target[x, y] = round(255 * red_bias * pink_bias)

            if inside(u, v, DARK_RECTS) and 7 < luma < 118:
                dark_target[x, y] = 255

    # Close antialiased gaps and slightly expand thin whisker/mouth strokes.
    pink = pink.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.4))
    dark = dark.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.6))
    fixed = ImageChops.lighter(pink, dark)
    return Image.merge("RGB", (fixed, Image.new("L", fixed.size, 0), Image.new("L", fixed.size, 0)))


def main() -> None:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
