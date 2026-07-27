"""Repair Color Guinea Pig balloon zones using optimized-model UV islands.

Before running, unpack the optimized GLB to a separate glTF directory:

    pnpm dlx @gltf-transform/cli copy \
      public/models/toys/color-guinea-pig/model-mobile-v001.glb \
      C:/tmp/color-guinea-pig-inspect/model.gltf
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
BASE_MASK = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-guinea-pig"
    / "balloon-zones-mobile-v002.webp"
)
OUTPUT = BASE_MASK.with_name("balloon-zones-mobile-v003.webp")


def read_geometry(unpacked: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    document = json.loads((unpacked / "model.gltf").read_text(encoding="utf-8"))
    payload = (unpacked / "model.bin").read_bytes()
    index_accessor = document["accessors"][0]
    index_view = document["bufferViews"][index_accessor["bufferView"]]
    vertex_view = document["bufferViews"][1]
    vertex_count = document["accessors"][1]["count"]
    indices = np.frombuffer(
        payload,
        dtype="<u2",
        count=index_accessor["count"],
        offset=index_view.get("byteOffset", 0) + index_accessor.get("byteOffset", 0),
    ).reshape(-1, 3)
    vertices = np.ndarray(
        (vertex_count, 8),
        dtype="<f4",
        buffer=payload,
        offset=vertex_view["byteOffset"],
        strides=(vertex_view["byteStride"], 4),
    )
    return indices, vertices[:, :3], vertices[:, 3:5]


def resolve_zone(points: np.ndarray) -> int:
    center_x = float(points[:, 0].mean())
    min_x = float(points[:, 0].min())
    min_y = float(points[:, 1].min())
    max_y = float(points[:, 1].max())
    if min_y < 0.01:
        return 0
    if center_x > 0.4:
        return 3
    if min_y > 0.44 and center_x < 0.36:
        return 2
    if center_x < 0.1 and max_y < 0.58 and min_x < 0.1:
        return 1
    return 0


def build_uv_islands(triangles: np.ndarray, texcoords: np.ndarray) -> np.ndarray:
    parent = np.arange(triangles.shape[0], dtype=np.int32)
    rank = np.zeros(triangles.shape[0], dtype=np.uint8)

    def find(value: int) -> int:
        root = value
        while parent[root] != root:
            root = int(parent[root])
        while parent[value] != value:
            next_value = int(parent[value])
            parent[value] = root
            value = next_value
        return root

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root == right_root:
            return
        if rank[left_root] < rank[right_root]:
            parent[left_root] = right_root
        elif rank[left_root] > rank[right_root]:
            parent[right_root] = left_root
        else:
            parent[right_root] = left_root
            rank[left_root] += 1

    quantized = np.round((texcoords - np.floor(texcoords)) * 100_000).astype(np.int32)
    edge_to_face: dict[tuple[tuple[int, int], tuple[int, int]], int] = {}
    for face_index, triangle in enumerate(triangles):
        uv_keys = [tuple(quantized[int(vertex)]) for vertex in triangle]
        for left, right in ((0, 1), (1, 2), (2, 0)):
            edge = tuple(sorted((uv_keys[left], uv_keys[right])))
            previous = edge_to_face.get(edge)
            if previous is None:
                edge_to_face[edge] = face_index
            else:
                union(face_index, previous)
    return np.array([find(index) for index in range(triangles.shape[0])], dtype=np.int32)


def repair_mask(unpacked: Path) -> tuple[Image.Image, list[int]]:
    triangles, positions, texcoords = read_geometry(unpacked)
    roots = build_uv_islands(triangles, texcoords)
    size = Image.open(BASE_MASK).size[0]
    repair_channels = [Image.new("L", (size, size), 0) for _ in range(3)]
    draws = [ImageDraw.Draw(channel) for channel in repair_channels]
    counts = [0, 0, 0]

    for root in np.unique(roots):
        selected = roots == root
        island_triangles = triangles[selected]
        points = positions[np.unique(island_triangles.reshape(-1))]
        zone = resolve_zone(points)
        if zone == 0:
            continue
        for triangle_uv in texcoords[island_triangles]:
            polygon = [
                (
                    float(np.mod(uv[0], 1.0) * (size - 1)),
                    float(np.mod(uv[1], 1.0) * (size - 1)),
                )
                for uv in triangle_uv
            ]
            draws[zone - 1].polygon(polygon, fill=255)
            counts[zone - 1] += 1

    repaired_channels = [
        channel.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.35))
        for channel in repair_channels
    ]
    repair = Image.merge("RGB", tuple(repaired_channels))
    repair_coverage = Image.fromarray(
        np.asarray(repair, dtype=np.uint8).max(axis=2),
        "L",
    )
    base = Image.open(BASE_MASK).convert("RGB")
    return Image.composite(repair, base, repair_coverage), counts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--unpacked",
        type=Path,
        default=Path(r"C:\tmp\color-guinea-pig-inspect"),
    )
    args = parser.parse_args()
    mask, counts = repair_mask(args.unpacked)
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, repaired triangles={counts})"
    )


if __name__ == "__main__":
    main()
