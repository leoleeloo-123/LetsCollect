import io
import json
import struct
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


SCRIPT = Path(__file__).with_name("build-color-bird-mask-v004.py")
SPEC = spec_from_file_location("color_bird_mask_v004", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v004 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v004)
mask_builder = mask_v004.mask_builder
mask_builder.OUTPUT = mask_builder.RUNTIME_DIR / "protect-mask-mobile-v005.webp"

SOURCE_MODEL = mask_builder.ROOT / "assets" / "models" / "source" / "color-bird" / "model-source-v001.glb"


def read_source_geometry() -> tuple[dict, bytes]:
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
        return np.ndarray((accessor["count"],), dtype=dtype, buffer=binary, offset=offset, strides=(stride,))
    return np.ndarray(
        (accessor["count"], components),
        dtype=dtype,
        buffer=binary,
        offset=offset,
        strides=(stride, item_size),
    )


def read_source_texture(document: dict, binary: bytes) -> Image.Image:
    material = document["materials"][0]
    texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    texture = document["textures"][texture_index]
    source_index = texture.get("extensions", {}).get("EXT_texture_webp", {}).get("source", texture.get("source"))
    if source_index is None:
        raise ValueError("Source base-color texture has no image")
    image = document["images"][source_index]
    view = document["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    return Image.open(io.BytesIO(binary[start : start + view["byteLength"]])).convert("RGB")


def inside_box(
    positions: np.ndarray,
    x_range: tuple[float, float],
    y_range: tuple[float, float],
    z_range: tuple[float, float],
) -> np.ndarray:
    return (
        (positions[:, 0] >= x_range[0])
        & (positions[:, 0] <= x_range[1])
        & (positions[:, 1] >= y_range[0])
        & (positions[:, 1] <= y_range[1])
        & (positions[:, 2] >= z_range[0])
        & (positions[:, 2] <= z_range[1])
    )


def bake_geometry_zones(size: int) -> tuple[Image.Image, Image.Image]:
    document, binary = read_source_geometry()
    primitive = document["meshes"][0]["primitives"][0]
    positions = read_accessor(document, binary, primitive["attributes"]["POSITION"])
    uvs = read_accessor(document, binary, primitive["attributes"]["TEXCOORD_0"])
    triangles = read_accessor(document, binary, primitive["indices"]).reshape((-1, 3))

    left_eye = inside_box(positions, (-0.125, 0.025), (0.26, 0.46), (0.625, 0.73))
    right_eye = inside_box(positions, (0.455, 0.555), (0.26, 0.46), (0.29, 0.55))
    beak = inside_box(positions, (0.075, 0.455), (0.10, 0.51), (0.59, 0.76))

    base = np.asarray(read_source_texture(document, binary), dtype=np.int16)
    triangle_uvs = uvs[triangles]
    centroids = triangle_uvs.mean(axis=1)
    sample_x = np.clip(np.rint(centroids[:, 0] * (base.shape[1] - 1)), 0, base.shape[1] - 1).astype(np.int32)
    sample_y = np.clip(np.rint(centroids[:, 1] * (base.shape[0] - 1)), 0, base.shape[0] - 1).astype(np.int32)
    sampled = base[sample_y, sample_x]
    eye_dark = sampled.max(axis=1) < 105
    beak_warm = (
        (sampled[:, 0] > 115)
        & (sampled[:, 0] - sampled[:, 1] > 18)
        & (sampled[:, 1] - sampled[:, 2] > 42)
    )
    foot_warm = (
        (sampled[:, 0] > 90)
        & (sampled[:, 0] - sampled[:, 1] > 20)
        & (sampled[:, 1] - sampled[:, 2] > 22)
    )
    foot_uv = np.zeros(len(centroids), dtype=bool)
    for left, top, right, bottom in mask_builder.FOOT_RECTS:
        foot_uv |= (
            (centroids[:, 0] >= left)
            & (centroids[:, 0] <= right)
            & (centroids[:, 1] >= top)
            & (centroids[:, 1] <= bottom)
        )
    eyes = (left_eye[triangles].all(axis=1) | right_eye[triangles].all(axis=1)) & eye_dark
    # The source has two disconnected surfaces inside the beak's 3D bounds.
    # Only the actual beak component lives on the right-hand UV island.
    beak_triangles = beak[triangles].all(axis=1) & (centroids[:, 0] >= 0.70) & beak_warm
    feet = (positions[:, 1] <= -0.48)[triangles].all(axis=1) & foot_warm & foot_uv

    scale = size - 1

    def rasterize(selection: np.ndarray) -> Image.Image:
        target = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(target)
        for triangle in triangle_uvs[selection]:
            draw.polygon([(float(u * scale), float(v * scale)) for u, v in triangle], fill=255)
        return target

    eye_mask = rasterize(eyes).filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    beak_mask = rasterize(beak_triangles)
    fixed = ImageChops.lighter(eye_mask, beak_mask)
    fixed = fixed.filter(ImageFilter.GaussianBlur(0.75))

    centroid_y = positions[triangles, 1].mean(axis=1)
    head_amount = np.clip((centroid_y - 0.36) / (0.54 - 0.36), 0.0, 1.0)
    head_amount = head_amount * head_amount * (3.0 - 2.0 * head_amount)
    head_selection = head_amount > 0.0
    head = Image.new("L", (size, size), 0)
    head_draw = ImageDraw.Draw(head)
    for triangle, amount in zip(triangle_uvs[head_selection], head_amount[head_selection], strict=True):
        head_draw.polygon(
            [(float(u * scale), float(v * scale)) for u, v in triangle],
            fill=round(float(amount) * 255),
        )
    head = head.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    return fixed, head


def build_mask() -> Image.Image:
    _, _, blush = mask_v004.build_mask().split()
    fixed, head = bake_geometry_zones(mask_builder.MASK_SIZE)
    head = ImageChops.multiply(head, ImageOps.invert(ImageChops.lighter(fixed, blush)))
    return Image.merge("RGB", (fixed, head, blush))


mask_builder.build_mask = build_mask


if __name__ == "__main__":
    mask_builder.main()
