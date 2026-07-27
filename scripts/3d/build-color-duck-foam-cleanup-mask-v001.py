import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-duck"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "foam-cleanup-mask-mobile-v001.webp"
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


def build_mask() -> tuple[Image.Image, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    core = Image.new("L", base.size, 0)
    candidate = Image.new("L", base.size, 0)
    source = base.load()
    core_pixels = core.load()
    candidate_pixels = candidate.load()

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            minimum = min(red, green, blue)
            maximum = max(red, green, blue)
            spread = maximum - minimum
            red_dominance = red - (green + blue) * 0.5

            white_core = min(
                ramp(minimum, 186.0, 48.0),
                1.0 - ramp(spread, 34.0, 50.0),
            )
            foam_candidate = min(
                ramp(green, 88.0, 92.0),
                ramp(blue, 92.0, 88.0),
                ramp((green + blue) * 0.5, 108.0, 86.0),
                1.0 - ramp(red_dominance, 72.0, 62.0),
            )
            core_pixels[x, y] = round(255 * white_core)
            candidate_pixels[x, y] = round(255 * foam_candidate)

    foam = core
    for _ in range(3):
        foam = foam.filter(ImageFilter.MaxFilter(9))
        foam = ImageChops.multiply(foam, candidate)
    foam = foam.filter(ImageFilter.GaussianBlur(0.45))
    active = sum(foam.get_flattened_data())
    return foam, active / (255 * MASK_SIZE * MASK_SIZE)


def main() -> None:
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} foam coverage)"
    )


if __name__ == "__main__":
    main()
