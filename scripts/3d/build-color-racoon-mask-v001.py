import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-racoon"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "tanghulu-mask-mobile-v001.webp"
MASK_SIZE = 512


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


def ramp(value: float, start: float, width: float) -> float:
    return max(0.0, min(1.0, (value - start) / width))


def build_mask() -> tuple[Image.Image, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    candy = Image.new("L", base.size, 0)
    source = base.load()
    target = candy.load()

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            strength = min(
                ramp(red, 45.0, 95.0),
                ramp(red - green, 28.0, 90.0),
                ramp(red - blue, 20.0, 85.0),
                1.0 - ramp(green, 130.0, 80.0),
            )
            target[x, y] = round(255 * strength)

    candy = candy.filter(ImageFilter.MaxFilter(5))
    candy = candy.filter(ImageFilter.MinFilter(5))
    candy = candy.point(
        lambda value: 0 if value < 28 else round((value - 28) * 255 / 227)
    )
    candy = candy.filter(ImageFilter.GaussianBlur(0.65))
    empty = Image.new("L", base.size, 0)
    coverage = sum(
        value * count for value, count in enumerate(candy.histogram())
    ) / (255 * MASK_SIZE * MASK_SIZE)
    return Image.merge("RGB", (candy, empty, empty)), coverage


def main() -> None:
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} candy coverage)"
    )


if __name__ == "__main__":
    main()
