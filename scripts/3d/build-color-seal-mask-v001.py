import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-seal"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "starfish-mask-mobile-v001.webp"

MASK_SIZE = 512

# The yellow starfish crosses three UV islands in the source atlas.
STARFISH_UV_RECTS = (
    (0.00, 0.00, 0.26, 0.34),
    (0.73, 0.00, 0.98, 0.24),
    (0.30, 0.90, 0.61, 1.00),
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
        _, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {MODEL}")
        binary_start = glb.tell()

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
        glb.seek(binary_start + view.get("byteOffset", 0))
        image_bytes = glb.read(view["byteLength"])
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def inside_star_uv(u: float, v: float) -> bool:
    return any(
        left <= u <= right and top <= v <= bottom
        for left, top, right, bottom in STARFISH_UV_RECTS
    )


def ramp(value: float, start: float, width: float) -> float:
    return max(0.0, min(1.0, (value - start) / width))


def fill_enclosed_holes(mask: Image.Image, threshold: int = 48) -> Image.Image:
    result = mask.copy()
    source = mask.load()
    target = result.load()

    for left, top, right, bottom in STARFISH_UV_RECTS:
        x0 = max(0, round(left * (MASK_SIZE - 1)))
        y0 = max(0, round(top * (MASK_SIZE - 1)))
        x1 = min(MASK_SIZE - 1, round(right * (MASK_SIZE - 1)))
        y1 = min(MASK_SIZE - 1, round(bottom * (MASK_SIZE - 1)))
        outside: set[tuple[int, int]] = set()
        queue: list[tuple[int, int]] = []

        for x in range(x0, x1 + 1):
            queue.extend(((x, y0), (x, y1)))
        for y in range(y0 + 1, y1):
            queue.extend(((x0, y), (x1, y)))

        while queue:
            x, y = queue.pop()
            if (x, y) in outside or source[x, y] >= threshold:
                continue
            outside.add((x, y))
            if x > x0:
                queue.append((x - 1, y))
            if x < x1:
                queue.append((x + 1, y))
            if y > y0:
                queue.append((x, y - 1))
            if y < y1:
                queue.append((x, y + 1))

        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if source[x, y] < threshold and (x, y) not in outside:
                    target[x, y] = 255

    return result


def build_mask() -> tuple[Image.Image, float, float, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    star_mask = Image.new("L", base.size, 0)
    cleanup_mask = Image.new("L", base.size, 0)
    detail_mask = Image.new("L", base.size, 0)
    source = base.load()
    star_target = star_mask.load()
    cleanup_target = cleanup_mask.load()
    detail_target = detail_mask.load()
    star_active = 0
    cleanup_active = 0
    detail_active = 0

    for y in range(MASK_SIZE):
        v = y / (MASK_SIZE - 1)
        for x in range(MASK_SIZE):
            u = x / (MASK_SIZE - 1)
            if not inside_star_uv(u, v):
                continue
            red, green, blue = source[x, y]
            star_strength = min(
                ramp(red - blue, 42.0, 42.0),
                ramp(green - blue, 24.0, 38.0),
                ramp(red, 158.0, 68.0),
                ramp(green, 104.0, 78.0),
            )
            cleanup_strength = min(
                ramp(red - blue, 12.0, 34.0),
                ramp(green - blue, 5.0, 28.0),
                ramp(red, 132.0, 72.0),
                ramp(green, 78.0, 92.0),
            )
            maximum = max(red, green, blue)
            minimum = min(red, green, blue)
            detail_strength = min(
                ramp(214.0 - maximum, 4.0, 74.0),
                ramp(48.0 - (maximum - minimum), 6.0, 32.0),
            )
            star_value = round(255 * star_strength)
            cleanup_value = round(255 * cleanup_strength)
            detail_value = round(255 * detail_strength)
            star_target[x, y] = star_value
            cleanup_target[x, y] = cleanup_value
            detail_target[x, y] = detail_value
            star_active += star_value
            cleanup_active += cleanup_value
            detail_active += detail_value


    # Fill enclosed pale facial patches without expanding into the valleys
    # between the star points, then pull the outer recolor edge slightly inward.
    star_mask = fill_enclosed_holes(star_mask)
    star_mask = star_mask.filter(ImageFilter.MinFilter(9))
    star_mask = star_mask.filter(ImageFilter.GaussianBlur(0.45))
    cleanup_mask = cleanup_mask.filter(ImageFilter.MaxFilter(9))
    cleanup_mask = cleanup_mask.filter(ImageFilter.GaussianBlur(0.65))
    detail_mask = detail_mask.filter(ImageFilter.MaxFilter(3))
    detail_mask = detail_mask.filter(ImageFilter.GaussianBlur(0.45))
    detail_mask = ImageChops.multiply(detail_mask, star_mask)
    star_coverage = star_active / (255 * MASK_SIZE * MASK_SIZE)
    cleanup_coverage = cleanup_active / (255 * MASK_SIZE * MASK_SIZE)
    detail_coverage = detail_active / (255 * MASK_SIZE * MASK_SIZE)
    return (
        Image.merge("RGB", (star_mask, cleanup_mask, detail_mask)),
        star_coverage,
        cleanup_coverage,
        detail_coverage,
    )


def main() -> None:
    mask, star_coverage, cleanup_coverage, detail_coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {star_coverage:.1%} starfish, "
        f"{cleanup_coverage:.1%} cleanup, {detail_coverage:.1%} detail coverage)"
    )


if __name__ == "__main__":
    main()
