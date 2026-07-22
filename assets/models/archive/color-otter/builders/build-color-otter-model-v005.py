"""Split the original Color Otter candy surface into a direct-color material.

This builder preserves every source triangle and vertex position. The candy and
the cheek share one connected mesh, so only the candy UV island is assigned to
the color material; the attached rear/transition faces stay on the base atlas.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

import numpy as np


base_path = Path(__file__).with_name("build-color-otter-model-v002.py")
spec = importlib.util.spec_from_file_location("color_otter_v002", base_path)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load Color Otter GLB helpers")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


CANDY_UV_CENTER = np.array([0.706, 0.300], dtype=np.float32)
CANDY_UV_RADII = np.array([0.100, 0.088], dtype=np.float32)
CANDY_UV_BROAD_CENTER = np.array([0.715, 0.293], dtype=np.float32)
CANDY_UV_BROAD_RADII = np.array([0.108, 0.096], dtype=np.float32)
CANDY_SURFACE_CENTER = np.array([0.484124, 0.268, 0.239], dtype=np.float32)
CANDY_SURFACE_RADII = np.array([0.14075, 0.1646, 0.196], dtype=np.float32)


def find_lower_candy_cap(
    indices: np.ndarray,
    positions: np.ndarray,
    normals: np.ndarray,
    uvs: np.ndarray,
) -> np.ndarray:
    triangles = indices.reshape(-1, 3).astype(np.int64, copy=False)
    connected = base.DisjointSet(len(positions))
    for a, b, c in triangles:
        connected.union(int(a), int(b))
        connected.union(int(a), int(c))

    groups: dict[int, list[int]] = {}
    for triangle_index, triangle in enumerate(triangles):
        groups.setdefault(connected.find(int(triangle[0])), []).append(triangle_index)

    target_center = np.array([0.423, -0.056, 0.154], dtype=np.float32)
    candidates = []
    for root, triangle_indices in groups.items():
        component_triangles = triangles[np.asarray(triangle_indices, dtype=np.int64)]
        points = positions[np.unique(component_triangles)]
        minimum = points.min(axis=0)
        maximum = points.max(axis=0)
        center = (minimum + maximum) * 0.5
        if minimum[0] > 0.18 and maximum[0] > 0.52 and maximum[1] < 0.16:
            candidates.append((float(np.linalg.norm(center - target_center)), root))
    if not candidates:
        raise ValueError("Could not find the lower candy cap component")

    target_root = min(candidates, key=lambda item: item[0])[1]
    triangle_roots = np.asarray([connected.find(int(triangle[0])) for triangle in triangles])
    centroids = positions[triangles].mean(axis=1)
    relative = (centroids - np.array([0.484, 0.268, 0.240])) / np.array([0.19, 0.235, 0.235])
    triangle_normals = normals[triangles].mean(axis=1)
    triangle_normals /= np.maximum(np.linalg.norm(triangle_normals, axis=1, keepdims=True), 1e-6)
    uv_centroids = uvs[triangles].mean(axis=1)
    connector_boundary = 0.548 - 0.25 * (uv_centroids[:, 1] - 0.620)
    return (
        (triangle_roots == target_root)
        & (np.square(relative).sum(axis=1) < 1.25)
        & (centroids[:, 1] > 0.02)
        & (triangle_normals[:, 1] < -0.10)
        & (uv_centroids[:, 0] <= connector_boundary)
    )


def split_original_candy(document: dict, binary_chunk: bytearray) -> dict:
    meshes = document.get("meshes", [])
    if len(meshes) != 1 or len(meshes[0].get("primitives", [])) != 1:
        raise ValueError("Expected one optimized Color Otter mesh and primitive")

    primitive = meshes[0]["primitives"][0]
    index_accessor = document["accessors"][primitive["indices"]]
    component_type = index_accessor["componentType"]
    indices = base.read_accessor(document, binary_chunk, primitive["indices"])
    positions = base.read_accessor(document, binary_chunk, primitive["attributes"]["POSITION"])
    normals = base.read_accessor(document, binary_chunk, primitive["attributes"]["NORMAL"])
    uvs = base.read_accessor(document, binary_chunk, primitive["attributes"]["TEXCOORD_0"])
    triangles = indices.reshape(-1, 3)

    connected_mask, _, connected_details = base.find_lollipop_triangles(indices, positions)
    uv_centroids = uvs[triangles].mean(axis=1)
    uv_distance = np.square((uv_centroids - CANDY_UV_CENTER) / CANDY_UV_RADII).sum(axis=1)
    uv_core_mask = connected_mask & (uv_distance <= 1.0)

    centroids = positions[triangles].mean(axis=1)
    triangle_normals = normals[triangles].mean(axis=1)
    triangle_normals /= np.maximum(np.linalg.norm(triangle_normals, axis=1, keepdims=True), 1e-6)
    relative = (centroids - CANDY_SURFACE_CENTER) / CANDY_SURFACE_RADII
    surface_gradient = relative / CANDY_SURFACE_RADII
    surface_gradient /= np.maximum(np.linalg.norm(surface_gradient, axis=1, keepdims=True), 1e-6)
    surface_alignment = np.sum(triangle_normals * surface_gradient, axis=1)
    broad_uv_distance = np.square(
        (uv_centroids - CANDY_UV_BROAD_CENTER) / CANDY_UV_BROAD_RADII
    ).sum(axis=1)
    surface_extension_mask = connected_mask & (
        (
            (broad_uv_distance <= 1.0)
            & (surface_alignment > 0.20)
        )
        | (
            (broad_uv_distance > 1.0)
            & (surface_alignment > 0.0)
            & (centroids[:, 1] < 0.31)
            & (centroids[:, 2] > 0.09)
        )
    )
    shell_mask = uv_core_mask | surface_extension_mask

    selected_edges: set[tuple[int, int]] = set()
    for triangle in triangles[shell_mask]:
        for left, right in ((triangle[0], triangle[1]), (triangle[1], triangle[2]), (triangle[2], triangle[0])):
            selected_edges.add(tuple(sorted((int(left), int(right)))))
    edge_adjacent_mask = np.zeros(len(triangles), dtype=bool)
    for triangle_index, triangle in enumerate(triangles):
        if shell_mask[triangle_index]:
            continue
        edge_adjacent_mask[triangle_index] = any(
            tuple(sorted((int(left), int(right)))) in selected_edges
            for left, right in ((triangle[0], triangle[1]), (triangle[1], triangle[2]), (triangle[2], triangle[0]))
        )

    front_boundary_fill_mask = (
        connected_mask
        & ~shell_mask
        & edge_adjacent_mask
        & (centroids[:, 0] > 0.34)
        & (centroids[:, 0] < 0.37)
        & (centroids[:, 1] > 0.31)
        & (centroids[:, 1] < 0.345)
        & (centroids[:, 2] > 0.22)
        & (np.abs(triangle_normals[:, 1]) < 0.20)
    )
    if front_boundary_fill_mask.sum() != 5:
        raise ValueError("Expected exactly five front boundary fill triangles")
    shell_mask |= front_boundary_fill_mask

    lower_cap_mask = find_lower_candy_cap(indices, positions, normals, uvs)
    candy_mask = shell_mask | lower_cap_mask

    if shell_mask.sum() < 4000 or lower_cap_mask.sum() < 1000:
        raise ValueError("Candy surface selection is unexpectedly small")
    if np.any(shell_mask & lower_cap_mask):
        raise ValueError("Candy shell and lower cap selections unexpectedly overlap")

    base_accessor = base.append_index_accessor(
        document,
        binary_chunk,
        triangles[~candy_mask],
        component_type,
    )
    candy_accessor = base.append_index_accessor(
        document,
        binary_chunk,
        triangles[candy_mask],
        component_type,
    )

    materials = document.setdefault("materials", [])
    base_material_index = primitive.get("material")
    if base_material_index is not None:
        materials[base_material_index]["name"] = "Otter_Base"
    candy_material_index = len(materials)
    materials.append(
        {
            "name": "Lollipop_Color",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.94, 0.63, 0.72, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.58,
            },
        }
    )

    base_primitive = dict(primitive)
    base_primitive["indices"] = base_accessor
    candy_primitive = dict(primitive)
    candy_primitive["indices"] = candy_accessor
    candy_primitive["material"] = candy_material_index
    meshes[0]["name"] = "Color_Otter"
    meshes[0]["primitives"] = [base_primitive, candy_primitive]

    candy_points = positions[np.unique(triangles[candy_mask])]
    return {
        "source_triangles": int(len(triangles)),
        "candy_component_triangles": connected_details["triangles"],
        "candy_shell_triangles": int(shell_mask.sum()),
        "candy_shell_extension_triangles": int((surface_extension_mask & ~uv_core_mask).sum()),
        "candy_front_boundary_fill_triangles": int(front_boundary_fill_mask.sum()),
        "candy_lower_cap_triangles": int(lower_cap_mask.sum()),
        "candy_material_triangles": int(candy_mask.sum()),
        "base_material_triangles": int((~candy_mask).sum()),
        "candy_bounds_min": candy_points.min(axis=0).astype(float).tolist(),
        "candy_bounds_max": candy_points.max(axis=0).astype(float).tolist(),
        "uv_center": CANDY_UV_CENTER.astype(float).tolist(),
        "uv_radii": CANDY_UV_RADII.astype(float).tolist(),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    document, binary_chunk = base.read_glb(args.input)
    details = split_original_candy(document, binary_chunk)
    base.write_glb(args.output, document, binary_chunk)
    print(json.dumps(details, indent=2))


if __name__ == "__main__":
    main()
