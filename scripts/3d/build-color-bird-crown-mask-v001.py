"""Build the Color Bird v002 crown recolor mask.

First unpack the optimized runtime GLB:

    pnpm dlx @gltf-transform/cli copy \
      public/models/toys/color-bird/model-mobile-v002.glb \
      C:/tmp/color-bird-new-inspect-20260729-v2/model.gltf
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-bird"
    / "crown-mask-mobile-v001.webp"
)
CROWN_TRIANGLE_MASK_OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-bird"
    / "crown-triangle-mask-mobile-v001.bin"
)
MASK_SIZE = 1024
EXPECTED_TRIANGLE_COUNT = 59_958
PRIMARY_CROWN_TRIANGLE_START = 49_210
EARLY_SEAM_TRIANGLE_END = 1_200
CROWN_BASE_TRIANGLE_START = 48_776
CROWN_BASE_TRIANGLE_END = 49_210
CROWN_BODY_MIN_Y = 0.695
CROWN_BASE_MAX_NORMAL_Y = 0.55
CROWN_BASE_PROXIMITY_DISTANCE = 0.020
CROWN_BASE_SIDE_MIN_ABS_X = 0.20
FULL_CROWN_FLAG = 8


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
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
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
    return positions, texcoords, triangles


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


def build_exact_crown_triangles(
    positions: np.ndarray,
    triangles: np.ndarray,
) -> np.ndarray:
    if len(triangles) != EXPECTED_TRIANGLE_COUNT:
        raise ValueError(
            "Color Bird runtime topology changed: "
            f"expected {EXPECTED_TRIANGLE_COUNT} triangles, "
            f"received {len(triangles)}. Re-audit the crown boundary "
            "before rebuilding its exact triangle mask."
        )

    triangle_ids = np.arange(len(triangles))
    triangle_positions = positions[triangles]
    centroids = triangle_positions.mean(axis=1)
    face_normals = np.cross(
        triangle_positions[:, 1] - triangle_positions[:, 0],
        triangle_positions[:, 2] - triangle_positions[:, 0],
    )
    face_normals /= (
        np.linalg.norm(face_normals, axis=1, keepdims=True) + 1e-9
    )
    primary_crown = triangle_ids >= PRIMARY_CROWN_TRIANGLE_START
    seam_candidates = (
        (triangle_ids <= EARLY_SEAM_TRIANGLE_END)
        & (centroids[:, 0] >= -0.30)
        & (centroids[:, 0] <= 0.28)
        & (centroids[:, 1] >= 0.64)
        & (centroids[:, 1] <= 0.985)
        & (centroids[:, 2] >= -0.22)
        & (centroids[:, 2] <= 0.34)
    )

    quantized_positions = np.rint(positions / 1e-5).astype(np.int64)
    _, welded_vertex_ids = np.unique(
        quantized_positions,
        axis=0,
        return_inverse=True,
    )
    welded_triangles = welded_vertex_ids[triangles]
    edge_to_triangles: dict[tuple[int, int], list[int]] = defaultdict(list)
    relevant = primary_crown | seam_candidates
    for triangle_index, (a, b, c) in enumerate(welded_triangles):
        if not relevant[triangle_index]:
            continue
        for start, end in ((a, b), (b, c), (c, a)):
            edge = tuple(sorted((int(start), int(end))))
            edge_to_triangles[edge].append(triangle_index)

    adjacency: dict[int, set[int]] = defaultdict(set)
    for touching in edge_to_triangles.values():
        for triangle_index in touching:
            adjacency[triangle_index].update(
                neighbor
                for neighbor in touching
                if neighbor != triangle_index
            )

    exact_crown = primary_crown.copy()
    queue = deque(np.flatnonzero(primary_crown).tolist())
    while queue:
        triangle_index = queue.popleft()
        for neighbor in adjacency.get(triangle_index, ()):
            if seam_candidates[neighbor] and not exact_crown[neighbor]:
                exact_crown[neighbor] = True
                queue.append(neighbor)

    crown_base_candidates = (
        (triangle_ids >= CROWN_BASE_TRIANGLE_START)
        & (triangle_ids < CROWN_BASE_TRIANGLE_END)
    )
    crown_candidates = exact_crown | crown_base_candidates
    crown_geometry = (
        (centroids[:, 1] >= CROWN_BODY_MIN_Y)
        | (face_normals[:, 1] < CROWN_BASE_MAX_NORMAL_Y)
    )
    return crown_candidates & crown_geometry


def encode_crown_topology(
    positions: np.ndarray,
    triangles: np.ndarray,
    exact_crown: np.ndarray,
) -> np.ndarray:
    quantized_positions = np.rint(positions / 1e-5).astype(np.int64)
    _, welded_vertex_ids = np.unique(
        quantized_positions,
        axis=0,
        return_inverse=True,
    )
    welded_triangles = welded_vertex_ids[triangles]
    centroids = positions[triangles].mean(axis=1)
    seam_candidate = (
        (~exact_crown)
        & (centroids[:, 0] >= -0.31)
        & (centroids[:, 0] <= 0.29)
        & (centroids[:, 1] >= 0.60)
        & (centroids[:, 1] <= 0.72)
        & (centroids[:, 2] >= -0.23)
        & (centroids[:, 2] <= 0.35)
    )
    edge_to_triangles: dict[
        tuple[int, int],
        list[tuple[int, int, int]],
    ] = defaultdict(list)
    for triangle_index, triangle in enumerate(welded_triangles):
        for local_start, local_end in ((0, 1), (1, 2), (2, 0)):
            start = int(triangle[local_start])
            end = int(triangle[local_end])
            edge = tuple(sorted((start, end)))
            edge_to_triangles[edge].append(
                (triangle_index, local_start, local_end)
            )

    encoded = np.zeros(len(triangles), dtype=np.uint8)
    encoded[exact_crown] = FULL_CROWN_FLAG
    for touching in edge_to_triangles.values():
        if not any(exact_crown[item[0]] for item in touching):
            continue
        for triangle_index, local_start, local_end in touching:
            if not seam_candidate[triangle_index]:
                continue
            encoded[triangle_index] |= 1 << local_start
            encoded[triangle_index] |= 1 << local_end

    # Some crown-base and head triangles overlap visually without sharing
    # welded edges. Feather only the local vertices that sit extremely close
    # to the exact crown base, instead of promoting an entire head triangle.
    exact_base = exact_crown & (centroids[:, 1] < 0.72)
    crown_base_points = np.unique(
        np.round(positions[triangles[exact_base]].reshape(-1, 3), 6),
        axis=0,
    )
    proximity_candidate = seam_candidate & (
        centroids[:, 0] <= -CROWN_BASE_SIDE_MIN_ABS_X
    )
    candidate_indices = np.flatnonzero(proximity_candidate)
    candidate_positions = positions[triangles[candidate_indices]]
    flat_candidates = candidate_positions.reshape(-1, 3)
    minimum_distances = np.full(len(flat_candidates), np.inf)
    for start in range(0, len(flat_candidates), 400):
        candidate_chunk = flat_candidates[start : start + 400]
        minimum_distances[start : start + len(candidate_chunk)] = np.sqrt(
            np.sum(
                (
                    candidate_chunk[:, np.newaxis, :]
                    - crown_base_points[np.newaxis, :, :]
                )
                ** 2,
                axis=2,
            )
        ).min(axis=1)
    proximity_vertices = minimum_distances.reshape(-1, 3) <= (
        CROWN_BASE_PROXIMITY_DISTANCE
    )
    for candidate_offset, triangle_index in enumerate(candidate_indices):
        for local_vertex in np.flatnonzero(
            proximity_vertices[candidate_offset]
        ):
            encoded[triangle_index] |= 1 << int(local_vertex)
    return encoded


def build_mask(
    unpacked: Path,
) -> tuple[Image.Image, np.ndarray]:
    positions, texcoords, triangles = load_unpacked(unpacked)
    triangle_uvs = texcoords[triangles]
    exact_crown = build_exact_crown_triangles(positions, triangles)
    crown_topology = encode_crown_topology(
        positions,
        triangles,
        exact_crown,
    )
    crown_channel = (
        rasterize(
            triangle_uvs,
            exact_crown,
        )
        .filter(ImageFilter.MaxFilter(5))
        .filter(ImageFilter.GaussianBlur(0.35))
    )

    empty = Image.new("L", crown_channel.size, 0)
    return (
        Image.merge("RGB", (crown_channel, empty, empty)),
        crown_topology,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--unpacked",
        type=Path,
        default=Path(r"C:\tmp\color-bird-new-inspect-20260729-v2"),
    )
    args = parser.parse_args()
    mask, crown_topology = build_mask(args.unpacked)
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    CROWN_TRIANGLE_MASK_OUTPUT.write_bytes(
        crown_topology.tobytes()
    )
    exact_crown_count = int(
        np.count_nonzero(crown_topology & FULL_CROWN_FLAG)
    )
    seam_triangle_count = int(
        np.count_nonzero(crown_topology & 0b111)
    )
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, "
        f"exact crown triangles={exact_crown_count}, "
        f"boundary seam triangles={seam_triangle_count}, "
        f"triangle mask bytes="
        f"{CROWN_TRIANGLE_MASK_OUTPUT.stat().st_size})"
    )


if __name__ == "__main__":
    main()
