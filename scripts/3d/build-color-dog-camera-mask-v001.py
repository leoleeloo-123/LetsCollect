import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-dog-camera"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "accessory-mask-mobile-v001.webp"
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
    yellow = Image.new("L", base.size, 0)
    source = base.load()
    target = yellow.load()
    active = 0

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            strength = min(
                ramp(red - blue, 42.0, 54.0),
                ramp(green - blue, 18.0, 50.0),
                ramp(max(red, green), 92.0, 78.0),
            )
            value = round(255 * strength)
            target[x, y] = value
            active += value

    yellow = yellow.filter(ImageFilter.MaxFilter(9))
    yellow = yellow.filter(ImageFilter.MinFilter(9))
    yellow = yellow.filter(ImageFilter.GaussianBlur(0.85))
    empty = Image.new("L", base.size, 0)
    coverage = active / (255 * MASK_SIZE * MASK_SIZE)
    return Image.merge("RGB", (yellow, empty, empty)), coverage


def main() -> None:
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", quality=92, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} yellow coverage)"
    )


if __name__ == "__main__":
    main()
