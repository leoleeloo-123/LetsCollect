import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-sheep"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "accessory-mask-mobile-v001.webp"
MASK_SIZE = 1024


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
        source_index = texture.get("extensions", {}).get("EXT_texture_webp", {}).get(
            "source", texture.get("source")
        )
        if source_index is None:
            raise ValueError("Base-color texture has no image source")

        image = document["images"][source_index]
        view = document["bufferViews"][image["bufferView"]]
        glb.seek(binary_start + view.get("byteOffset", 0))
        image_bytes = glb.read(view["byteLength"])

    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def ramp(value: float, start: float, width: float) -> float:
    return max(0.0, min(1.0, (value - start) / width))


def build_mask() -> tuple[Image.Image, float, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    cloak = Image.new("L", base.size, 0)
    bow = Image.new("L", base.size, 0)
    source = base.load()
    cloak_target = cloak.load()
    bow_target = bow.load()
    cloak_active = 0
    bow_active = 0

    mask_scale = MASK_SIZE / 512
    bow_uv_regions = tuple(
        tuple(round(value * mask_scale) for value in region)
        for region in (
            (474, 354, 511, 423),
            (174, 474, 220, 511),
            (34, 484, 64, 511),
        )
    )

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]

            cloak_strength = min(
                ramp(red - green, 34.0, 56.0),
                ramp(blue - green, 4.0, 32.0),
                ramp(red, 105.0, 80.0),
            )
            cloak_value = round(255 * cloak_strength)
            cloak_target[x, y] = cloak_value
            cloak_active += cloak_value

            in_bow_region = any(
                left <= x <= right and top <= y <= bottom
                for left, top, right, bottom in bow_uv_regions
            )
            if not in_bow_region:
                continue

            bow_strength = min(
                ramp(red - green, 18.0, 38.0),
                ramp(red - blue, 14.0, 42.0),
                ramp(blue - green, -16.0, 20.0),
                ramp(red, 135.0, 80.0),
            )
            bow_value = round(255 * bow_strength)
            bow_target[x, y] = bow_value
            bow_active += bow_value

    cloak = cloak.filter(ImageFilter.MaxFilter(13))
    cloak = cloak.filter(ImageFilter.MinFilter(13))
    cloak = cloak.filter(ImageFilter.GaussianBlur(1.2))

    bow = bow.filter(ImageFilter.MaxFilter(9))
    bow = bow.filter(ImageFilter.MinFilter(9))
    bow = bow.filter(ImageFilter.GaussianBlur(1.1))

    empty = Image.new("L", base.size, 0)
    pixel_count = 255 * MASK_SIZE * MASK_SIZE
    return (
        Image.merge("RGB", (cloak, bow, empty)),
        cloak_active / pixel_count,
        bow_active / pixel_count,
    )


def main() -> None:
    mask, cloak_coverage, bow_coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, "
        f"{cloak_coverage:.1%} cloak coverage, "
        f"{bow_coverage:.2%} bow coverage)"
    )


if __name__ == "__main__":
    main()
