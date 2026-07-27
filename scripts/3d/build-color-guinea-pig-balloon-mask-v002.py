import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "models" / "source" / "color-guinea-pig" / "model-source-v001.glb"
OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-guinea-pig"
    / "balloon-zones-mobile-v002.webp"
)
MASK_SIZE = 1024
CHUNK_TRIANGLES = 100_000

COMPONENT_TYPES = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
}
COMPONENT_DTYPES = {
    5121: np.dtype("<u1"),
    5123: np.dtype("<u2"),
    5125: np.dtype("<u4"),
    5126: np.dtype("<f4"),
}


def read_glb() -> tuple[dict, bytes]:
    with SOURCE.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {SOURCE}")

        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {SOURCE}")
        document = json.loads(glb.read(json_length))

        binary_length, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {SOURCE}")
        binary = glb.read(binary_length)
    return document, binary


def read_accessor(document: dict, binary: bytes, accessor_index: int) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    dtype = COMPONENT_DTYPES[accessor["componentType"]]
    components = COMPONENT_TYPES[accessor["type"]]
    count = accessor["count"]
    item_bytes = dtype.itemsize * components
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", item_bytes)

    if stride == item_bytes:
        values = np.frombuffer(
            binary,
            dtype=dtype,
            count=count * components,
            offset=offset,
        )
        return values.reshape(count, components)

    return np.ndarray(
        shape=(count, components),
        dtype=dtype,
        buffer=binary,
        offset=offset,
        strides=(stride, dtype.itemsize),
    )


def read_base_texture(document: dict, binary: bytes) -> Image.Image:
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
    start = view.get("byteOffset", 0)
    image_bytes = binary[start : start + view["byteLength"]]
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def is_pink(pixels: np.ndarray) -> np.ndarray:
    red = pixels[:, 0].astype(np.int16)
    green = pixels[:, 1].astype(np.int16)
    blue = pixels[:, 2].astype(np.int16)
    return (
        (red - green > 18)
        & (blue - green > 5)
        & (red > 98)
        & (blue > 78)
    )


def classify_balloon(points: np.ndarray) -> np.ndarray:
    x = points[:, 0]
    y = points[:, 1]
    zone = np.zeros(points.shape[0], dtype=np.uint8)

    heart = (x > -0.16) & (x < 0.352) & (y > 0.444)
    star = (x < 0.12) & ~heart
    oval = (x > 0.27) & ~heart
    heart |= ~(star | oval)

    zone[star] = 1
    zone[heart] = 2
    zone[oval] = 3

    balloon_region = (
        ((zone == 1) & (x > -0.52) & (y > -0.02) & (y < 0.72))
        | ((zone == 2) & (x > -0.2) & (x < 0.4) & (y > 0.4))
        | ((zone == 3) & (x > 0.3) & (y > 0) & (y < 0.92))
    )
    zone[~balloon_region] = 0
    return zone


def build_mask() -> tuple[Image.Image, list[int]]:
    document, binary = read_glb()
    primitive = document["meshes"][0]["primitives"][0]
    positions = read_accessor(document, binary, primitive["attributes"]["POSITION"])
    texcoords = read_accessor(document, binary, primitive["attributes"]["TEXCOORD_0"])
    indices = read_accessor(document, binary, primitive["indices"]).reshape(-1)
    triangles = indices.reshape(-1, 3)

    base = np.asarray(
        read_base_texture(document, binary).resize(
            (MASK_SIZE, MASK_SIZE),
            Image.Resampling.LANCZOS,
        ),
        dtype=np.uint8,
    )
    channels = [Image.new("L", (MASK_SIZE, MASK_SIZE), 0) for _ in range(3)]
    draw = [ImageDraw.Draw(channel) for channel in channels]
    triangle_counts = [0, 0, 0]

    for start in range(0, triangles.shape[0], CHUNK_TRIANGLES):
        selected_triangles = triangles[start : start + CHUNK_TRIANGLES]
        triangle_positions = positions[selected_triangles]
        triangle_texcoords = texcoords[selected_triangles]
        centers = triangle_positions.mean(axis=1)
        uv_centers = np.mod(triangle_texcoords.mean(axis=1), 1.0)
        sample_x = np.clip(
            np.floor(uv_centers[:, 0] * MASK_SIZE).astype(np.int32),
            0,
            MASK_SIZE - 1,
        )
        sample_y = np.clip(
            np.floor(uv_centers[:, 1] * MASK_SIZE).astype(np.int32),
            0,
            MASK_SIZE - 1,
        )
        zones = classify_balloon(centers)
        active = zones > 0

        for triangle_uv, zone in zip(
            triangle_texcoords[active],
            zones[active],
            strict=True,
        ):
            points = [
                (
                    float(np.mod(uv[0], 1.0) * (MASK_SIZE - 1)),
                    float(np.mod(uv[1], 1.0) * (MASK_SIZE - 1)),
                )
                for uv in triangle_uv
            ]
            draw[int(zone) - 1].polygon(points, fill=255)
            triangle_counts[int(zone) - 1] += 1

    combined = Image.merge(
        "RGB",
        tuple(
            channel.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.35))
            for channel in channels
        ),
    )
    return combined, triangle_counts


def main() -> None:
    mask, triangle_counts = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, triangles={triangle_counts})"
    )


if __name__ == "__main__":
    main()
