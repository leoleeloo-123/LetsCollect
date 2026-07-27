import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE_MODEL = ROOT / "assets" / "models" / "source" / "color-seal" / "model-source-v001.glb"
OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-seal"
    / "starfish-object-mask-mobile-v001.webp"
)
MASK_SIZE = 256
MIN_X, MAX_X = -0.36, 0.10
MIN_Y, MAX_Y = -0.14, 0.27
MIN_Z, MAX_Z = 0.25, 0.55
STARFISH_UV_RECTS = (
    (0.00, 0.00, 0.26, 0.34),
    (0.73, 0.00, 0.98, 0.24),
    (0.30, 0.90, 0.61, 1.00),
)


def read_source_glb() -> tuple[dict, bytes]:
    with SOURCE_MODEL.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {SOURCE_MODEL}")
        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {SOURCE_MODEL}")
        document = json.loads(glb.read(json_length))
        binary_length, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {SOURCE_MODEL}")
        binary = glb.read(binary_length)
    return document, binary


def accessor_array(document: dict, binary: bytes, accessor_index: int) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    component_count = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[
        accessor["type"]
    ]
    data_type = {5126: np.dtype("<f4"), 5125: np.dtype("<u4")}[
        accessor["componentType"]
    ]
    stride = view.get("byteStride", component_count * data_type.itemsize)
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    return np.ndarray(
        shape=(accessor["count"], component_count),
        dtype=data_type,
        buffer=binary,
        offset=offset,
        strides=(stride, data_type.itemsize),
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
    image_bytes = binary[start : start + view["byteLength"]]
    return Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(
        (512, 512), Image.Resampling.LANCZOS
    )


def build_object_mask() -> tuple[Image.Image, int]:
    document, binary = read_source_glb()
    primitive = document["meshes"][0]["primitives"][0]
    positions = accessor_array(
        document, binary, primitive["attributes"]["POSITION"]
    )
    uvs = accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"])
    base = np.asarray(read_base_texture(document, binary), dtype=np.float32)

    pixel_x = np.clip(np.rint(uvs[:, 0] * 511).astype(np.int32), 0, 511)
    pixel_y = np.clip(np.rint(uvs[:, 1] * 511).astype(np.int32), 0, 511)
    colors = base[pixel_y, pixel_x]
    red, green, blue = colors[:, 0], colors[:, 1], colors[:, 2]

    inside_uv = np.zeros(len(uvs), dtype=bool)
    for left, top, right, bottom in STARFISH_UV_RECTS:
        inside_uv |= (
            (uvs[:, 0] >= left)
            & (uvs[:, 0] <= right)
            & (uvs[:, 1] >= top)
            & (uvs[:, 1] <= bottom)
        )

    selected = (
        inside_uv
        & ((red - blue) >= 54)
        & ((green - blue) >= 34)
        & (red >= 175)
        & (green >= 125)
        & (positions[:, 0] >= MIN_X)
        & (positions[:, 0] <= MAX_X)
        & (positions[:, 1] >= MIN_Y)
        & (positions[:, 1] <= MAX_Y)
        & (positions[:, 2] >= MIN_Z)
    )
    star_positions = positions[selected]

    mask_x = np.clip(
        np.rint((star_positions[:, 0] - MIN_X) / (MAX_X - MIN_X) * (MASK_SIZE - 1)),
        0,
        MASK_SIZE - 1,
    ).astype(np.int32)
    mask_y = np.clip(
        np.rint((star_positions[:, 1] - MIN_Y) / (MAX_Y - MIN_Y) * (MASK_SIZE - 1)),
        0,
        MASK_SIZE - 1,
    ).astype(np.int32)

    silhouette = np.zeros((MASK_SIZE, MASK_SIZE), dtype=np.uint8)
    silhouette[mask_y, mask_x] = 255
    silhouette_image = Image.fromarray(silhouette, "L")
    silhouette_image = silhouette_image.filter(ImageFilter.MaxFilter(5))
    silhouette_image = silhouette_image.filter(ImageFilter.MinFilter(3))
    flooded = silhouette_image.point(lambda value: 255 if value >= 24 else 0)
    ImageDraw.floodfill(flooded, (0, 0), 128, thresh=0)
    holes = flooded.point(lambda value: 255 if value == 0 else 0)
    silhouette_image = ImageChops.lighter(silhouette_image, holes)
    silhouette_image = silhouette_image.filter(ImageFilter.GaussianBlur(0.55))

    height = np.full((MASK_SIZE, MASK_SIZE), 255, dtype=np.uint8)
    height_values = np.clip(
        np.rint(
            (star_positions[:, 2] - MIN_Z) / (MAX_Z - MIN_Z) * 255
        ),
        0,
        255,
    ).astype(np.uint8)
    flat_indices = mask_y * MASK_SIZE + mask_x
    np.minimum.at(height.reshape(-1), flat_indices, height_values)
    height_image = Image.fromarray(height, "L").filter(ImageFilter.MinFilter(11))
    empty = Image.new("L", silhouette_image.size, 0)
    return (
        Image.merge(
            "RGB",
            (silhouette_image, height_image, empty),
        ),
        int(selected.sum()),
    )


def main() -> None:
    mask, selected_vertices = build_object_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {selected_vertices:,} source vertices)"
    )


if __name__ == "__main__":
    main()
