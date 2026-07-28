import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE_MODEL = (
    ROOT
    / "assets"
    / "models"
    / "source"
    / "color-hamster-icecream"
    / "model-source-v001.glb"
)
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-hamster-icecream"
RUNTIME_MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "icecream-mask-mobile-v001.webp"
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


def read_accessor(document: dict, binary: bytes, accessor_index: int) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    dtype = {
        5123: np.uint16,
        5125: np.uint32,
        5126: np.float32,
    }[accessor["componentType"]]
    components = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
    }[accessor["type"]]
    item_size = np.dtype(dtype).itemsize
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", item_size * components)
    if components == 1:
        return np.ndarray(
            (accessor["count"],),
            dtype=dtype,
            buffer=binary,
            offset=offset,
            strides=(stride,),
        )
    return np.ndarray(
        (accessor["count"], components),
        dtype=dtype,
        buffer=binary,
        offset=offset,
        strides=(stride, item_size),
    )


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


def red_strength(pixels: np.ndarray) -> np.ndarray:
    values = pixels.astype(np.float32)
    red = values[..., 0]
    green = values[..., 1]
    blue = values[..., 2]
    return np.minimum.reduce(
        (
            np.clip((red - 145.0) / 70.0, 0.0, 1.0),
            np.clip((red - green - 78.0) / 62.0, 0.0, 1.0),
            np.clip((red - blue - 72.0) / 68.0, 0.0, 1.0),
        )
    )


def report_source_bounds() -> None:
    document, binary = read_glb(SOURCE_MODEL)
    primitive = document["meshes"][0]["primitives"][0]
    positions = read_accessor(
        document, binary, primitive["attributes"]["POSITION"]
    ).astype(np.float32)
    uvs = read_accessor(
        document, binary, primitive["attributes"]["TEXCOORD_0"]
    ).astype(np.float32)
    texture = np.asarray(read_base_texture(document, binary), dtype=np.uint8)
    sample_x = np.clip(
        np.rint(uvs[:, 0] * (texture.shape[1] - 1)),
        0,
        texture.shape[1] - 1,
    ).astype(np.int32)
    sample_y = np.clip(
        np.rint(uvs[:, 1] * (texture.shape[0] - 1)),
        0,
        texture.shape[0] - 1,
    ).astype(np.int32)
    sampled = texture[sample_y, sample_x].astype(np.int16)
    for separation in (45, 65, 85, 105, 125):
        selected = positions[
            (sampled[:, 0] >= 150)
            & (sampled[:, 0] - sampled[:, 1] >= separation)
            & (sampled[:, 0] - sampled[:, 2] >= separation)
        ]
        if not len(selected):
            continue
        minimum = selected.min(axis=0)
        maximum = selected.max(axis=0)
        center = selected.mean(axis=0)
        print(
            f"Red separation {separation}: "
            f"min={minimum.round(5).tolist()} "
            f"max={maximum.round(5).tolist()} "
            f"center={center.round(5).tolist()} "
            f"vertices={len(selected):,}"
        )
        if separation >= 105:
            quantiles = np.quantile(
                selected, (0.01, 0.05, 0.25, 0.5, 0.75, 0.95, 0.99), axis=0
            )
            print(f"  quantiles={quantiles.round(4).tolist()}")


def build_mask() -> tuple[Image.Image, float]:
    document, binary = read_glb(RUNTIME_MODEL)
    base = read_base_texture(document, binary).resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    strength = red_strength(np.asarray(base, dtype=np.uint8))
    mask = Image.fromarray(np.uint8(np.rint(strength * 255)), "L")
    mask = mask.filter(ImageFilter.MaxFilter(5))
    mask = mask.filter(ImageFilter.MinFilter(5))
    mask = mask.point(
        lambda value: 0 if value < 22 else round((value - 22) * 255 / 233)
    )
    mask = mask.filter(ImageFilter.GaussianBlur(0.65))
    empty = Image.new("L", mask.size, 0)
    coverage = sum(
        value * count for value, count in enumerate(mask.histogram())
    ) / (255 * MASK_SIZE * MASK_SIZE)
    return Image.merge("RGB", (mask, empty, empty)), coverage


def main() -> None:
    report_source_bounds()
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} ice-cream coverage)"
    )


if __name__ == "__main__":
    main()
