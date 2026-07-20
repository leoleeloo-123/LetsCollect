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
EAR_RECTS = (
    (0.245, 0.075, 0.290, 0.130),
    (0.445, 0.095, 0.565, 0.185),
    (0.765, 0.300, 0.860, 0.380),
    (0.940, 0.055, 1.000, 0.145),
)
FACE_PINK_RECTS = (
    (0.425, 0.170, 0.575, 0.305),
    (0.040, 0.435, 0.265, 0.565),
    (0.390, 0.495, 0.695, 0.640),
    (0.650, 0.465, 0.800, 0.625),
)
DARK_RECTS = (
    # Screen-right closed eye, nose outline, and mouth.
    (0.445, 0.180, 0.507, 0.218),
    (0.528, 0.212, 0.570, 0.258),
    (0.498, 0.238, 0.562, 0.288),
    # Screen-left whiskers, closed eye, and the nose seam fragment.
    (0.082, 0.462, 0.133, 0.545),
    (0.145, 0.505, 0.225, 0.558),
    (0.232, 0.478, 0.258, 0.525),
    # Remaining whisker/eye islands on the right and lower face.
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
            if (is_ear or inside(u, v, FACE_PINK_RECTS)) and red > 155 and blue > 82:
                red_bias = max(0.0, min(1.0, (red - green - 10.0) / 28.0))
                pink_bias = max(0.0, min(1.0, (34.0 - (green - blue)) / 36.0))
                amount = round(255 * red_bias * pink_bias)
                if is_ear:
                    ear_target[x, y] = amount
                else:
                    pink_target[x, y] = amount

            dark_brown = red - green > 9 and green - blue > 3
            if inside(u, v, DARK_RECTS) and 7 < luma < 148 and dark_brown:
                dark_target[x, y] = 255

    # Ear folds and nose highlights can be much lighter than their surrounding
    # pink. Close authored internal gaps without expanding the UV edge.
    ear = ear.point(lambda value: 255 if value >= 28 else 0)
    ear = ear.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41))
    ear = ear.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    pink = pink.point(lambda value: min(255, value * 2))
    pink = pink.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    pink = pink.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(2.2))
    dark = dark.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
    fixed = ImageChops.lighter(ImageChops.lighter(ear, pink), dark)
    empty = Image.new("L", fixed.size, 0)
    return Image.merge("RGB", (fixed, empty, empty))


def main() -> None:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
