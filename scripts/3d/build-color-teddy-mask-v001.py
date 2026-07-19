import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-teddy"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "protect-mask-mobile-v001.webp"
MASK_SIZE = 1024

# The Teddy atlas reuses the eye and cheek islands for both sides. Narrow UV
# rectangles keep dark coat shadows and pale highlights outside the face from
# becoming protected accidentally.
EYE_RECTS = (
    (0.628, 0.070, 0.684, 0.132),
    (0.545, 0.195, 0.595, 0.255),
)
MUZZLE_RECTS = ((0.400, 0.210, 0.570, 0.325),)
NOSE_RECTS = ((0.435, 0.225, 0.525, 0.330),)
MOUTH_RECTS = ((0.440, 0.270, 0.535, 0.335),)
SMILE_RECTS = ((0.030, 0.870, 0.125, 0.920),)
BLUSH_RECTS = (
    (0.545, 0.085, 0.650, 0.165),
    (0.585, 0.220, 0.660, 0.300),
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


def build_mask() -> Image.Image:
    base = read_base_texture().resize((MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS)
    eye = Image.new("L", base.size, 0)
    details = Image.new("L", base.size, 0)
    muzzle = Image.new("L", base.size, 0)
    blush = Image.new("L", base.size, 0)
    source = base.load()
    eye_target = eye.load()
    detail_target = details.load()
    muzzle_target = muzzle.load()
    blush_target = blush.load()

    for y in range(MASK_SIZE):
        v = y / (MASK_SIZE - 1)
        for x in range(MASK_SIZE):
            u = x / (MASK_SIZE - 1)
            red, green, blue = source[x, y]
            luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue

            if inside(u, v, EYE_RECTS) and 8 < luma < 105:
                eye_target[x, y] = 255

            light_muzzle = (
                inside(u, v, MUZZLE_RECTS)
                and red > 205
                and blue > 150
                and red - green < 60
                and green - blue < 60
            )
            if light_muzzle:
                muzzle_target[x, y] = 255

            dark_nose = inside(u, v, NOSE_RECTS) and 8 < luma < 105
            dark_mouth = inside(u, v, MOUTH_RECTS) and 8 < luma < 105
            dark_smile = inside(u, v, SMILE_RECTS) and 8 < luma < 105
            if dark_nose or dark_mouth or dark_smile:
                detail_target[x, y] = 255

            if inside(u, v, BLUSH_RECTS) and red > 220 and blue > 105:
                red_bias = max(0.0, min(1.0, (red - green - 56.0) / 32.0))
                pink_bias = max(0.0, min(1.0, (46.0 - (green - blue)) / 28.0))
                blush_target[x, y] = round(255 * red_bias * pink_bias)

    # Close glossy highlights inside the eyes and nose. The cream muzzle gets
    # its own channel so the shader can use a clean fixed color at its edge.
    eye = eye.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    eye = eye.filter(ImageFilter.MinFilter(3))
    details = details.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    fixed = ImageChops.lighter(eye, details).filter(ImageFilter.GaussianBlur(0.3))
    muzzle = muzzle.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.MinFilter(21))
    muzzle = muzzle.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    muzzle_boundary = Image.new("L", base.size, 0)
    boundary_draw = ImageDraw.Draw(muzzle_boundary)
    boundary_draw.ellipse((
        round(MASK_SIZE * 0.400),
        round(MASK_SIZE * 0.205),
        round(MASK_SIZE * 0.575),
        round(MASK_SIZE * 0.335),
    ), fill=255)
    muzzle = ImageChops.multiply(muzzle, muzzle_boundary)
    blush = blush.filter(ImageFilter.GaussianBlur(4.0))
    return Image.merge("RGB", (fixed, blush, muzzle))
def main() -> None:
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
