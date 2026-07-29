"""Build precise Color Penguin v003 earmuff-top and cup recolor zones.

First unpack the optimized Draco runtime:

    pnpm dlx @gltf-transform/cli copy \
      public/models/toys/color-penguin/model-mobile-v003.glb \
      C:/tmp/color-penguin-v003-inspect/model.gltf \
      --vertex-layout separate

The texture mask combines source-pink pixels, selected full-mesh topology
components, and heart protection. The triangle mask stores one byte per
triangle:

    bit 0 = earmuff-top component
    bit 1 = cup component
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-penguin"
OUTPUT = RUNTIME_DIR / "accessory-mask-mobile-v003.webp"
ZONE_TRIANGLE_MASK_OUTPUT = (
    RUNTIME_DIR / "zone-triangle-mask-mobile-v003.bin"
)
MASK_SIZE = 1024


def read_accessor(
    document: dict,
    payload: bytes,
    accessor_index: int,
) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    dtype = {
        5121: np.uint8,
        5123: np.uint16,
        5125: np.uint32,
        5126: np.float32,
    }[accessor["componentType"]]
    component_count = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
        "VEC4": 4,
    }[accessor["type"]]
    item_size = np.dtype(dtype).itemsize
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", item_size * component_count)
    if component_count == 1:
        return np.ndarray(
            (accessor["count"],),
            dtype=dtype,
            buffer=payload,
            offset=offset,
            strides=(stride,),
        )
    return np.ndarray(
        (accessor["count"], component_count),
        dtype=dtype,
        buffer=payload,
        offset=offset,
        strides=(stride, item_size),
    )


def load_unpacked(
    unpacked: Path,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    document = json.loads((unpacked / "model.gltf").read_text(encoding="utf-8"))
    payload = (unpacked / "model.bin").read_bytes()
    primitive = document["meshes"][0]["primitives"][0]
    positions = read_accessor(
        document,
        payload,
        primitive["attributes"]["POSITION"],
    )
    texcoords = read_accessor(
        document,
        payload,
        primitive["attributes"]["TEXCOORD_0"],
    )
    triangles = read_accessor(
        document,
        payload,
        primitive["indices"],
    ).reshape(-1, 3)
    base_color_path = next(unpacked.glob("baseColor*.webp"))
    texture = np.asarray(Image.open(base_color_path).convert("RGB"))
    return positions, texcoords, triangles, texture


def find_components(triangles: np.ndarray) -> list[np.ndarray]:
    parent = np.arange(len(triangles), dtype=np.int32)

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = int(parent[index])
        return index

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    triangle_by_vertex: dict[int, int] = {}
    for triangle_index, triangle in enumerate(triangles):
        for vertex in triangle:
            vertex_index = int(vertex)
            if vertex_index in triangle_by_vertex:
                union(triangle_index, triangle_by_vertex[vertex_index])
            else:
                triangle_by_vertex[vertex_index] = triangle_index

    grouped: dict[int, list[int]] = defaultdict(list)
    for triangle_index in range(len(triangles)):
        grouped[find(triangle_index)].append(triangle_index)
    return [
        np.asarray(component, dtype=np.int32)
        for component in grouped.values()
    ]


def rasterize(
    triangle_uvs: np.ndarray,
    selection: np.ndarray,
) -> Image.Image:
    target = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    draw = ImageDraw.Draw(target)
    scale = MASK_SIZE - 1
    for triangle in triangle_uvs[selection]:
        draw.polygon(
            [
                (
                    float(np.mod(uv[0], 1.0) * scale),
                    float(np.mod(uv[1], 1.0) * scale),
                )
                for uv in triangle
            ],
            fill=255,
        )
    return target


def build_mask(
    unpacked: Path,
) -> tuple[Image.Image, np.ndarray, tuple[int, int]]:
    positions, texcoords, triangles, texture = load_unpacked(unpacked)
    triangle_positions = positions[triangles]
    centroids = triangle_positions.mean(axis=1)
    triangle_uvs = texcoords[triangles]

    texture_int = texture.astype(np.int16)
    pink_pixels = (
        (texture_int[:, :, 0] >= 75)
        & (texture_int[:, :, 0] - texture_int[:, :, 1] >= 18)
        & (texture_int[:, :, 0] - texture_int[:, :, 2] >= -15)
        & (texture_int[:, :, 2] - texture_int[:, :, 1] >= -35)
    )
    pink_channel = Image.fromarray(
        np.where(pink_pixels, 255, 0).astype(np.uint8),
        mode="L",
    )
    triangle_samples = texture[
        np.clip(
            np.rint(
                np.mod(triangle_uvs.mean(axis=1)[:, 1], 1.0)
                * (texture.shape[0] - 1)
            ),
            0,
            texture.shape[0] - 1,
        ).astype(np.int32),
        np.clip(
            np.rint(
                np.mod(triangle_uvs.mean(axis=1)[:, 0], 1.0)
                * (texture.shape[1] - 1)
            ),
            0,
            texture.shape[1] - 1,
        ).astype(np.int32),
    ].astype(np.int16)
    pink_triangle_centers = (
        (triangle_samples[:, 0] >= 75)
        & (triangle_samples[:, 0] - triangle_samples[:, 1] >= 18)
        & (triangle_samples[:, 0] - triangle_samples[:, 2] >= -15)
        & (triangle_samples[:, 2] - triangle_samples[:, 1] >= -35)
    )

    earmuff_triangles = np.zeros(len(triangles), dtype=bool)
    cup_triangles = np.zeros(len(triangles), dtype=bool)
    earmuff_components = 0
    cup_components = 0

    for component in find_components(triangles):
        component_centroids = centroids[component]
        minimum = component_centroids.min(axis=0)
        maximum = component_centroids.max(axis=0)
        pink_count = int(np.count_nonzero(pink_triangle_centers[component]))

        is_earmuff_top = (
            pink_count >= 180
            and minimum[1] >= 0.42
            and maximum[1] >= 0.70
            and maximum[2] <= 0.22
        )
        is_cup = (
            pink_count >= 350
            and minimum[0] >= -0.25
            and maximum[0] <= 0.25
            and minimum[1] >= -0.28
            and maximum[1] <= 0.11
            and minimum[2] >= 0.20
            and maximum[2] >= 0.50
        )
        if is_earmuff_top:
            earmuff_triangles[component] = True
            earmuff_components += 1
        if is_cup:
            cup_triangles[component] = True
            cup_components += 1

    if earmuff_components != 4:
        raise RuntimeError(
            f"Expected 4 earmuff components, found {earmuff_components}"
        )
    if cup_components != 3:
        raise RuntimeError(f"Expected 3 cup components, found {cup_components}")

    earmuff_channel = ImageChops.multiply(
        rasterize(triangle_uvs, earmuff_triangles),
        pink_channel,
    )
    cup_channel = ImageChops.multiply(
        rasterize(triangle_uvs, cup_triangles),
        pink_channel,
    ).filter(ImageFilter.MaxFilter(3))
    heart_pixels = np.zeros((MASK_SIZE, MASK_SIZE), dtype=bool)
    for left, top, right, bottom in (
        (100, 660, 205, 735),
        (225, 575, 270, 635),
        (605, 770, 665, 825),
    ):
        heart_pixels[top:bottom, left:right] = ~pink_pixels[
            top:bottom,
            left:right,
        ]
    heart_channel = Image.fromarray(
        np.where(heart_pixels, 255, 0).astype(np.uint8),
        mode="L",
    ).filter(ImageFilter.MaxFilter(3))
    triangle_zones = np.zeros(len(triangles), dtype=np.uint8)
    triangle_zones[earmuff_triangles] |= 1
    triangle_zones[cup_triangles] |= 2
    return (
        Image.merge(
            "RGBA",
            (
                earmuff_channel,
                cup_channel,
                heart_channel,
                pink_channel,
            ),
        ),
        triangle_zones,
        (
            int(np.count_nonzero(earmuff_triangles)),
            int(np.count_nonzero(cup_triangles)),
        ),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--unpacked",
        type=Path,
        default=Path(r"C:\tmp\color-penguin-v003-inspect"),
    )
    args = parser.parse_args()
    mask, triangle_zones, counts = build_mask(args.unpacked)
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    ZONE_TRIANGLE_MASK_OUTPUT.write_bytes(triangle_zones.tobytes())
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, "
        f"earmuff/cup triangles={counts}); "
        f"{ZONE_TRIANGLE_MASK_OUTPUT.relative_to(ROOT)} "
        f"({ZONE_TRIANGLE_MASK_OUTPUT.stat().st_size} bytes)"
    )


if __name__ == "__main__":
    main()
