import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-koala"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "hat-mask-mobile-v001.webp"
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
        source_index = (
            texture.get("extensions", {})
            .get("EXT_texture_webp", {})
            .get("source", texture.get("source"))
        )
        if source_index is None:
            raise ValueError("Base-color texture has no image source")

        image = document["images"][source_index]
        view = document["bufferViews"][image["bufferView"]]
        glb.seek(binary_start + view.get("byteOffset", 0))
        image_bytes = glb.read(view["byteLength"])

    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def build_mask() -> Image.Image:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE),
        Image.Resampling.LANCZOS,
    )
    hat = Image.new("L", base.size, 0)
    source = base.load()
    target = hat.load()

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            blue_over_green = blue - green
            red_over_green = red - green
            blue_over_red = blue - red
            strength = min(
                max(0.0, min(1.0, (blue_over_green - 19.0) / 20.0)),
                max(0.0, min(1.0, (red_over_green - 7.0) / 18.0)),
                max(0.0, min(1.0, (blue_over_red + 5.0) / 16.0)),
            )
            target[x, y] = round(255 * strength)

    hat = hat.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    hat = hat.filter(ImageFilter.GaussianBlur(0.7))
    protected = ImageDraw.Draw(hat)

    protected.rectangle((301, 204, 322, 241), fill=0)
    empty = Image.new("L", base.size, 0)
    return Image.merge("RGB", (hat, empty, empty))


def main() -> None:
    mask = build_mask()
    mask.save(OUTPUT, "WEBP", quality=90, method=6)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
