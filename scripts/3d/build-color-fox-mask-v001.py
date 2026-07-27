import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-fox"
RUNTIME_MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "hat-feather-mask-mobile-v001.webp"
MASK_SIZE = 512


def read_glb(path: Path) -> tuple[dict, bytes]:
    with path.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {path}")
        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {path}")
        document = json.loads(glb.read(json_length))
        binary_length, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {path}")
        binary = glb.read(binary_length)
    return document, binary


def read_base_texture(document: dict, binary: bytes) -> Image.Image:
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
    return Image.open(io.BytesIO(binary[start : start + view["byteLength"]])).convert(
        "RGB"
    )


def hat_strength(pixels: np.ndarray) -> np.ndarray:
    values = pixels.astype(np.float32)
    maximum = values.max(axis=-1)
    minimum = values.min(axis=-1)
    spread = maximum - minimum
    return np.minimum(
        np.clip((152.0 - maximum) / 92.0, 0.0, 1.0),
        np.clip((92.0 - spread) / 62.0, 0.0, 1.0),
    )


def feather_strength(pixels: np.ndarray) -> np.ndarray:
    values = pixels.astype(np.float32)
    red = values[..., 0]
    green = values[..., 1]
    blue = values[..., 2]
    return np.minimum.reduce(
        (
            np.clip((red - 145.0) / 72.0, 0.0, 1.0),
            np.clip((red - green - 108.0) / 72.0, 0.0, 1.0),
            np.clip((red - blue - 100.0) / 78.0, 0.0, 1.0),
        )
    )


def finish_channel(strength: np.ndarray, *, grow: bool = False) -> Image.Image:
    channel = Image.fromarray(np.uint8(np.rint(strength * 255)), "L")
    channel = channel.filter(ImageFilter.MaxFilter(5))
    channel = channel.filter(ImageFilter.MinFilter(5))
    channel = channel.point(
        lambda value: 0 if value < 18 else round((value - 18) * 255 / 237)
    )
    if grow:
        channel = channel.filter(ImageFilter.MaxFilter(3))
    return channel.filter(ImageFilter.GaussianBlur(0.65))


def channel_coverage(channel: Image.Image) -> float:
    return sum(
        value * count for value, count in enumerate(channel.histogram())
    ) / (255 * MASK_SIZE * MASK_SIZE)


def build_mask() -> tuple[Image.Image, float, float]:
    document, binary = read_glb(RUNTIME_MODEL)
    base = read_base_texture(document, binary).resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    pixels = np.asarray(base, dtype=np.uint8)
    hat = finish_channel(hat_strength(pixels))
    feather = finish_channel(feather_strength(pixels), grow=True)
    empty = Image.new("L", hat.size, 0)
    return (
        Image.merge("RGB", (hat, feather, empty)),
        channel_coverage(hat),
        channel_coverage(feather),
    )


def main() -> None:
    mask, hat_coverage, feather_coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, "
        f"{hat_coverage:.1%} hat / {feather_coverage:.1%} feather coverage)"
    )


if __name__ == "__main__":
    main()
