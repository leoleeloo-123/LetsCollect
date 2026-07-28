import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-deer"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "accessory-mask-mobile-v001.webp"
MASK_SIZE = 1024
MIN_COMPONENT_PIXELS = 300


def remove_small_components(channel: Image.Image) -> Image.Image:
    remaining = np.asarray(channel, dtype=np.uint8).copy() > 0
    kept = np.zeros(remaining.shape, dtype=np.uint8)
    height, width = remaining.shape
    for y in range(height):
        for x in range(width):
            if not remaining[y, x]:
                continue
            remaining[y, x] = False
            stack = [(y, x)]
            component = []
            while stack:
                current_y, current_x = stack.pop()
                component.append((current_y, current_x))
                for delta_y in (-1, 0, 1):
                    for delta_x in (-1, 0, 1):
                        if delta_x == 0 and delta_y == 0:
                            continue
                        next_y = current_y + delta_y
                        next_x = current_x + delta_x
                        if (
                            0 <= next_y < height
                            and 0 <= next_x < width
                            and remaining[next_y, next_x]
                        ):
                            remaining[next_y, next_x] = False
                            stack.append((next_y, next_x))
            if len(component) >= MIN_COMPONENT_PIXELS:
                for component_y, component_x in component:
                    kept[component_y, component_x] = 255
    return Image.fromarray(kept, "L")

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
        binary = glb.read(binary_length)

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
    start = view.get("byteOffset", 0)
    return Image.open(
        io.BytesIO(binary[start : start + view["byteLength"]])
    ).convert("RGB")

def build_mask() -> tuple[Image.Image, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    pixels = np.asarray(base, dtype=np.float32)
    red = pixels[..., 0]
    green = pixels[..., 1]
    blue = pixels[..., 2]
    strength = np.minimum.reduce(
        (
            np.clip((red - 92.0) / 95.0, 0.0, 1.0),
            np.clip((red - green - 52.0) / 105.0, 0.0, 1.0),
            np.clip((red - blue - 30.0) / 115.0, 0.0, 1.0),
            np.clip((blue - green + 24.0) / 42.0, 0.0, 1.0),
        )
    )
    channel = Image.fromarray(np.where(strength >= 0.02, 255, 0).astype(np.uint8), "L")
    channel = remove_small_components(channel)
    channel = channel.filter(ImageFilter.MaxFilter(5))
    channel = channel.filter(ImageFilter.MinFilter(5))
    channel = channel.filter(ImageFilter.GaussianBlur(0.55))
    empty = Image.new("L", channel.size, 0)
    coverage = float(np.asarray(channel, dtype=np.float32).mean() / 255)
    return Image.merge("RGB", (channel, empty, empty)), coverage


def main() -> None:
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} coverage)"
    )


if __name__ == "__main__":
    main()
