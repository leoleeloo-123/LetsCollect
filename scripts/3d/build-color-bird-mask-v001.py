import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-bird"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "protect-mask-mobile-v001.webp"
MASK_SIZE = 512

# UV rectangles are intentionally narrow. Color tests inside each rectangle
# isolate the authored feature while avoiding neighboring face pixels.
EYE_RECTS = (
    (0.275, 0.155, 0.395, 0.305),
    (0.735, 0.145, 0.835, 0.285),
)
BEAK_RECTS = ((0.795, 0.145, 0.965, 0.325),)
FOOT_RECTS = (
    (0.420, 0.270, 0.845, 0.430),
    (0.775, 0.740, 0.980, 0.965),
)
BLUSH_RECTS = (
    (0.315, 0.195, 0.405, 0.305),
    (0.705, 0.025, 0.795, 0.130),
    (0.855, 0.220, 0.955, 0.325),
)


def read_base_texture() -> Image.Image:
    with MODEL.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {MODEL}")
        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {MODEL}")
        document = json.loads(glb.read(json_length))
        binary_length, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {MODEL}")
        binary_start = glb.tell()

        material = document["materials"][0]
        texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
        texture = document["textures"][texture_index]
        source_index = texture.get("extensions", {}).get("EXT_texture_webp", {}).get("source", texture.get("source"))
        if source_index is None:
            raise ValueError("Base-color texture has no image source")
        image = document["images"][source_index]
        view = document["bufferViews"][image["bufferView"]]
        glb.seek(binary_start + view.get("byteOffset", 0))
        image_bytes = glb.read(view["byteLength"])
        if len(image_bytes) > binary_length:
            raise ValueError("Invalid image buffer view")
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def inside(u: float, v: float, rectangles: tuple[tuple[float, float, float, float], ...]) -> bool:
    return any(left <= u <= right and top <= v <= bottom for left, top, right, bottom in rectangles)


def warm_score(red: int, green: int, blue: int) -> int:
    red_delta = max(0.0, min(1.0, (red - green - 18.0) / 45.0))
    yellow_delta = max(0.0, min(1.0, (green - blue - 18.0) / 36.0))
    brightness = max(0.0, min(1.0, (red - 110.0) / 90.0))
    return round(255 * min(red_delta, yellow_delta) * brightness)


def build_mask() -> Image.Image:
    base = read_base_texture().resize((MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS)
    fixed_features = Image.new("L", base.size, 0)
    eye_pixels = Image.new("L", base.size, 0)
    head = Image.new("L", base.size, 0)
    blush = Image.new("L", base.size, 0)
    source = base.load()
    fixed_target = fixed_features.load()
    eye_target = eye_pixels.load()
    head_target = head.load()
    blush_target = blush.load()

    for y in range(MASK_SIZE):
        v = y / (MASK_SIZE - 1)
        for x in range(MASK_SIZE):
            u = x / (MASK_SIZE - 1)
            red, green, blue = source[x, y]
            warmth = warm_score(red, green, blue)

            if inside(u, v, EYE_RECTS) and max(red, green, blue) < 105:
                eye_target[x, y] = 255

            beak = inside(u, v, BEAK_RECTS) and red > 115 and red - green > 18 and green - blue > 42
            feet = inside(u, v, FOOT_RECTS) and red > 90 and red - green > 20 and green - blue > 22
            if beak or feet:
                fixed_target[x, y] = 255

            blush_value = warmth if inside(u, v, BLUSH_RECTS) else 0
            blush_target[x, y] = blush_value
            head_target[x, y] = round(warmth * (1.0 - blush_value / 255.0))

    # Close the white highlights inside each eye, then add one texel of safety
    # around all fixed details. Soft edges keep bilinear sampling seam-free.
    eyes = eye_pixels.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    eyes = eyes.filter(ImageFilter.MaxFilter(3))
    fixed = ImageChops.lighter(fixed_features, eyes).filter(ImageFilter.MaxFilter(3))
    fixed = fixed.filter(ImageFilter.GaussianBlur(0.75))
    blush = blush.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    protected_or_blush = ImageChops.lighter(fixed, blush)
    head = ImageChops.multiply(head, ImageOps.invert(protected_or_blush))
    head = head.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    return Image.merge("RGB", (fixed, head, blush))


def main() -> None:
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
