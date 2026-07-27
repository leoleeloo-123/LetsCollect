"""Build Color Penguin recolor zones from the optimized model.

First unpack the Draco runtime GLB:

    pnpm dlx @gltf-transform/cli copy \
      public/models/toys/color-penguin/model-mobile-v001.glb \
      C:/tmp/color-penguin-inspect/model.gltf

Mask channels:
    R = pink top earmuff area
    G = all source-pink pixels
    B = pink cup
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-penguin"
    / "accessory-mask-mobile-v001.webp"
)
TRIANGLE_MASK_OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-penguin"
    / "cup-triangle-mask-mobile-v001.bin"
)
SCARF_TRIANGLE_MASK_OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-penguin"
    / "scarf-triangle-mask-mobile-v001.bin"
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


def select_cup_triangles(
    triangles: np.ndarray,
    cup: np.ndarray,
    centroids: np.ndarray,
) -> np.ndarray:
    selected = np.flatnonzero(cup)
    parent = {int(index): int(index) for index in selected}

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    triangle_by_vertex: dict[int, int] = {}
    for triangle_index in selected:
        for vertex in triangles[triangle_index]:
            vertex_index = int(vertex)
            if vertex_index in triangle_by_vertex:
                union(int(triangle_index), triangle_by_vertex[vertex_index])
            else:
                triangle_by_vertex[vertex_index] = int(triangle_index)

    components: dict[int, list[int]] = {}
    for triangle_index in selected:
        components.setdefault(find(int(triangle_index)), []).append(
            int(triangle_index)
        )

    result = np.zeros(len(triangles), dtype=np.uint8)
    for component in components.values():
        component_centroids = centroids[component]
        is_cup_body = component_centroids[:, 1].min() < 0
        is_central_rim = (
            component_centroids[:, 0].min() >= -0.10
            and component_centroids[:, 0].max() <= 0.14
        )
        if is_cup_body or is_central_rim:
            result[component] = 255
    return result


def select_scarf_triangles(
    triangles: np.ndarray,
    centroids: np.ndarray,
    pink_candidates: np.ndarray,
    cup_triangles: np.ndarray,
) -> np.ndarray:
    x, y, z = centroids.T
    broad_gate = (
        ((y >= 0.04) & (y <= 0.28))
        | ((np.abs(x) >= 0.23) & (y >= -0.56) & (y <= 0.36))
        | ((z <= -0.04) & (y >= -0.56) & (y <= 0.36))
    )
    selected = pink_candidates & broad_gate & (cup_triangles == 0) & (y < 0.45)

    triangle_by_vertex: dict[int, list[int]] = {}
    for triangle_index, triangle in enumerate(triangles):
        for vertex in triangle:
            triangle_by_vertex.setdefault(int(vertex), []).append(triangle_index)

    eligible_component = np.zeros(len(triangles), dtype=bool)
    visited = np.zeros(len(triangles), dtype=bool)
    for start in range(len(triangles)):
        if visited[start]:
            continue
        component: list[int] = []
        pending = [start]
        visited[start] = True
        while pending:
            triangle_index = pending.pop()
            component.append(triangle_index)
            for vertex in triangles[triangle_index]:
                for neighbor in triangle_by_vertex[int(vertex)]:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        pending.append(neighbor)
        if y[component].max() < 0.42:
            eligible_component[component] = True

    selected &= eligible_component
    for _ in range(4):
        grown = selected.copy()
        for triangle_index in np.flatnonzero(selected):
            for vertex in triangles[triangle_index]:
                for neighbor in triangle_by_vertex[int(vertex)]:
                    if (
                        broad_gate[neighbor]
                        and eligible_component[neighbor]
                        and cup_triangles[neighbor] == 0
                    ):
                        grown[neighbor] = True
        selected = grown

    return np.where(selected, 255, 0).astype(np.uint8)

def build_mask(
    unpacked: Path,
) -> tuple[Image.Image, tuple[int, int], np.ndarray]:
    positions, texcoords, triangles, texture = load_unpacked(unpacked)
    triangle_positions = positions[triangles]
    centroids = triangle_positions.mean(axis=1)
    triangle_uvs = texcoords[triangles]
    uv_samples = np.concatenate(
        (
            triangle_uvs,
            triangle_uvs.mean(axis=1, keepdims=True),
            (triangle_uvs + np.roll(triangle_uvs, -1, axis=1)) * 0.5,
        ),
        axis=1,
    )
    sample_x = np.clip(
        np.rint(np.mod(uv_samples[:, :, 0], 1.0) * (texture.shape[1] - 1)),
        0,
        texture.shape[1] - 1,
    ).astype(np.int32)
    sample_y = np.clip(
        np.rint(np.mod(uv_samples[:, :, 1], 1.0) * (texture.shape[0] - 1)),
        0,
        texture.shape[0] - 1,
    ).astype(np.int32)
    sampled = texture[sample_y, sample_x].astype(np.int16)

    pink_samples = (
        (sampled[:, :, 0] >= 125)
        & (sampled[:, :, 0] - sampled[:, :, 1] >= 30)
        & (sampled[:, :, 2] - sampled[:, :, 1] >= -25)
    )
    pink = pink_samples.sum(axis=1) >= 2
    earmuffs = pink & (centroids[:, 1] >= 0.40)
    cup_triangle_geometry = (
        (centroids[:, 0] >= -0.24)
        & (centroids[:, 0] <= 0.24)
        & (centroids[:, 1] >= -0.14)
        & (centroids[:, 1] <= 0.18)
        & (centroids[:, 2] >= 0.28)
        & (centroids[:, 2] <= 0.74)
    )
    cup = (
        pink
        & (centroids[:, 0] >= -0.22)
        & (centroids[:, 0] <= 0.22)
        & (centroids[:, 1] >= -0.12)
        & (centroids[:, 1] <= 0.15)
        & (centroids[:, 2] >= 0.30)
        & (centroids[:, 2] <= 0.72)
    )
    texture_int = texture.astype(np.int16)
    pink_pixels = (
        (texture_int[:, :, 0] >= 80)
        & (texture_int[:, :, 0] - texture_int[:, :, 1] >= 18)
        & (texture_int[:, :, 2] - texture_int[:, :, 1] >= -25)
    )
    pink_channel = Image.fromarray(
        np.where(pink_pixels, 255, 0).astype(np.uint8),
        mode="L",
    )

    earmuff_channel = ImageChops.multiply(
        rasterize(triangle_uvs, earmuffs).filter(ImageFilter.MaxFilter(3)),
        pink_channel,
    )
    pink_source_channel = pink_channel.filter(ImageFilter.MaxFilter(5))
    cup_channel = ImageChops.multiply(
        rasterize(triangle_uvs, cup).filter(ImageFilter.MaxFilter(3)),
        pink_channel.filter(ImageFilter.MaxFilter(5)),
    )
    cup_triangles = select_cup_triangles(
        triangles,
        cup_triangle_geometry,
        centroids,
    )
    scarf_triangles = select_scarf_triangles(
        triangles,
        centroids,
        pink_samples.sum(axis=1) >= 1,
        cup_triangles,
    )
    return (
        Image.merge("RGB", (earmuff_channel, pink_source_channel, cup_channel)),
        (int(earmuffs.sum()), int(cup.sum())),
        cup_triangles,
        scarf_triangles,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--unpacked",
        type=Path,
        default=Path(r"C:\tmp\color-penguin-inspect"),
    )
    args = parser.parse_args()
    mask, counts, cup_triangles, scarf_triangles = build_mask(args.unpacked)
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    TRIANGLE_MASK_OUTPUT.write_bytes(cup_triangles.tobytes())
    SCARF_TRIANGLE_MASK_OUTPUT.write_bytes(scarf_triangles.tobytes())
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, "
        f"earmuff/cup triangles={counts}, "
        f"exact cup triangles={int(np.count_nonzero(cup_triangles))}, "
        f"exact scarf triangles={int(np.count_nonzero(scarf_triangles))}, "
        f"triangle mask bytes={TRIANGLE_MASK_OUTPUT.stat().st_size})"
    )


if __name__ == "__main__":
    main()
