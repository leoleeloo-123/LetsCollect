"""Split the original Color Otter candy surface into a direct-color material.

The candy and cheek overlap at a narrow contact strip in the optimized model.
This builder keeps the source surface in place and clips that strip inside its
existing triangles, adding only interpolated boundary vertices.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

import numpy as np


base_path = Path(__file__).parents[2] / "assets/models/archive/color-otter/builders/build-color-otter-model-v002.py"
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
CONTACT_PATCH_SEED = np.array([0.315, 0.250, 0.300], dtype=np.float32)
CONTACT_PATCH_MIN = np.array([0.300, 0.100, 0.160], dtype=np.float32)
CONTACT_PATCH_MAX = np.array([0.500, 0.310, 0.430], dtype=np.float32)
CONTACT_PATCH_ELLIPSOID_CENTER = np.array([0.347, 0.245, 0.290], dtype=np.float32)
CONTACT_PATCH_ELLIPSOID_RADII = np.array([0.027, 0.130, 0.120], dtype=np.float32)
CONTACT_PATCH_ELLIPSOID_THRESHOLD = 1.0


def append_attribute_accessor(
    document: dict,
    binary_chunk: bytearray,
    values: np.ndarray,
    accessor_type: str,
) -> int:
    packed_values = np.asarray(values, dtype=np.dtype("<f4"))
    packed = packed_values.tobytes()
    while len(binary_chunk) % 4:
        binary_chunk.append(0)
    byte_offset = len(binary_chunk)
    binary_chunk.extend(packed)
    view_index = len(document["bufferViews"])
    document["bufferViews"].append(
        {
            "buffer": 0,
            "byteOffset": byte_offset,
            "byteLength": len(packed),
            "target": 34962,
        }
    )
    accessor_index = len(document["accessors"])
    document["accessors"].append(
        {
            "bufferView": view_index,
            "componentType": 5126,
            "count": int(len(packed_values)),
            "type": accessor_type,
            "min": packed_values.min(axis=0).astype(float).tolist(),
            "max": packed_values.max(axis=0).astype(float).tolist(),
        }
    )
    return accessor_index


def triangulate_polygon(polygon: list[int]) -> list[list[int]]:
    return [
        [polygon[0], polygon[index], polygon[index + 1]]
        for index in range(1, len(polygon) - 1)
    ]


def split_polygon(
    polygon: list[int],
    axis: int,
    boundary: float,
    keep_greater: bool,
    position_rows: list[np.ndarray],
    normal_rows: list[np.ndarray],
    uv_rows: list[np.ndarray],
) -> tuple[list[int], list[int]]:
    inside_polygon: list[int] = []
    outside_polygon: list[int] = []

    def inside(index: int) -> bool:
        value = float(position_rows[index][axis])
        return value >= boundary if keep_greater else value <= boundary

    def append_intersection(left: int, right: int) -> int:
        left_position = position_rows[left]
        right_position = position_rows[right]
        denominator = float(right_position[axis] - left_position[axis])
        factor = 0.5 if abs(denominator) < 1e-9 else (boundary - float(left_position[axis])) / denominator
        factor = float(np.clip(factor, 0.0, 1.0))
        position = left_position + (right_position - left_position) * factor
        normal = normal_rows[left] + (normal_rows[right] - normal_rows[left]) * factor
        normal /= max(float(np.linalg.norm(normal)), 1e-6)
        uv = uv_rows[left] + (uv_rows[right] - uv_rows[left]) * factor
        position_rows.append(position.astype(np.float32))
        normal_rows.append(normal.astype(np.float32))
        uv_rows.append(uv.astype(np.float32))
        return len(position_rows) - 1

    for offset, current in enumerate(polygon):
        following = polygon[(offset + 1) % len(polygon)]
        current_inside = inside(current)
        following_inside = inside(following)
        (inside_polygon if current_inside else outside_polygon).append(current)
        if current_inside != following_inside:
            intersection = append_intersection(current, following)
            inside_polygon.append(intersection)
            outside_polygon.append(intersection)
    return inside_polygon, outside_polygon


def split_polygon_ellipsoid(
    polygon: list[int],
    position_rows: list[np.ndarray],
    normal_rows: list[np.ndarray],
    uv_rows: list[np.ndarray],
) -> tuple[list[int], list[int]]:
    inside_polygon: list[int] = []
    outside_polygon: list[int] = []

    def field(index: int) -> float:
        relative = (position_rows[index] - CONTACT_PATCH_ELLIPSOID_CENTER) / CONTACT_PATCH_ELLIPSOID_RADII
        return float(np.dot(relative, relative) - CONTACT_PATCH_ELLIPSOID_THRESHOLD)

    def append_intersection(left: int, right: int) -> int:
        left_position = position_rows[left]
        right_position = position_rows[right]
        low = 0.0
        high = 1.0
        left_inside = field(left) <= 0.0
        for _ in range(28):
            middle = (low + high) * 0.5
            position = left_position + (right_position - left_position) * middle
            relative = (position - CONTACT_PATCH_ELLIPSOID_CENTER) / CONTACT_PATCH_ELLIPSOID_RADII
            middle_inside = float(np.dot(relative, relative)) <= CONTACT_PATCH_ELLIPSOID_THRESHOLD
            if middle_inside == left_inside:
                low = middle
            else:
                high = middle
        factor = (low + high) * 0.5
        position = left_position + (right_position - left_position) * factor
        normal = normal_rows[left] + (normal_rows[right] - normal_rows[left]) * factor
        normal /= max(float(np.linalg.norm(normal)), 1e-6)
        uv = uv_rows[left] + (uv_rows[right] - uv_rows[left]) * factor
        position_rows.append(position.astype(np.float32))
        normal_rows.append(normal.astype(np.float32))
        uv_rows.append(uv.astype(np.float32))
        return len(position_rows) - 1

    for offset, current in enumerate(polygon):
        following = polygon[(offset + 1) % len(polygon)]
        current_inside = field(current) <= 0.0
        following_inside = field(following) <= 0.0
        (inside_polygon if current_inside else outside_polygon).append(current)
        if current_inside != following_inside:
            intersection = append_intersection(current, following)
            inside_polygon.append(intersection)
            outside_polygon.append(intersection)
    return inside_polygon, outside_polygon
def split_contact_patch(
    triangles: np.ndarray,
    candy_mask: np.ndarray,
    positions: np.ndarray,
    normals: np.ndarray,
    uvs: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, dict]:
    connected = base.DisjointSet(len(positions))
    for left, middle, right in triangles:
        connected.union(int(left), int(middle))
        connected.union(int(left), int(right))
    triangle_roots = np.asarray([connected.find(int(triangle[0])) for triangle in triangles])
    centroids = positions[triangles].mean(axis=1)

    groups: dict[int, np.ndarray] = {}
    for root in np.unique(triangle_roots):
        groups[int(root)] = np.flatnonzero(triangle_roots == root)
    candidates: list[tuple[float, int]] = []
    for root, triangle_indices in groups.items():
        if not 3000 <= len(triangle_indices) <= 5000:
            continue
        if np.any(candy_mask[triangle_indices]):
            continue
        distance = float(
            np.linalg.norm(centroids[triangle_indices] - CONTACT_PATCH_SEED, axis=1).min()
        )
        candidates.append((distance, root))
    if not candidates:
        raise ValueError("Could not find the cheek contact component")

    target_root = min(candidates, key=lambda candidate: candidate[0])[1]
    target_mask = triangle_roots == target_root
    target_count = int(target_mask.sum())
    position_rows = [row.copy() for row in positions]
    normal_rows = [row.copy() for row in normals]
    uv_rows = [row.copy() for row in uvs]
    base_triangles: list[list[int]] = triangles[~candy_mask & ~target_mask].astype(np.int64).tolist()
    candy_triangles: list[list[int]] = triangles[candy_mask].astype(np.int64).tolist()
    contact_source_triangles = 0
    contact_candy_triangles = 0
    planes = (
        (0, float(CONTACT_PATCH_MIN[0]), True),
        (0, float(CONTACT_PATCH_MAX[0]), False),
        (1, float(CONTACT_PATCH_MIN[1]), True),
        (1, float(CONTACT_PATCH_MAX[1]), False),
        (2, float(CONTACT_PATCH_MIN[2]), True),
        (2, float(CONTACT_PATCH_MAX[2]), False),
    )

    for triangle in triangles[target_mask]:
        inside_polygons = [triangle.astype(np.int64).tolist()]
        for axis, boundary, keep_greater in planes:
            next_inside: list[list[int]] = []
            for polygon in inside_polygons:
                inside, outside = split_polygon(
                    polygon,
                    axis,
                    boundary,
                    keep_greater,
                    position_rows,
                    normal_rows,
                    uv_rows,
                )
                if len(outside) >= 3:
                    base_triangles.extend(triangulate_polygon(outside))
                if len(inside) >= 3:
                    next_inside.append(inside)
            inside_polygons = next_inside
            if not inside_polygons:
                break
        if inside_polygons:
            curved_inside: list[list[int]] = []
            for polygon in inside_polygons:
                inside, outside = split_polygon_ellipsoid(
                    polygon,
                    position_rows,
                    normal_rows,
                    uv_rows,
                )
                if len(outside) >= 3:
                    base_triangles.extend(triangulate_polygon(outside))
                if len(inside) >= 3:
                    curved_inside.append(inside)
            inside_polygons = curved_inside
        if inside_polygons:
            contact_source_triangles += 1
            for polygon in inside_polygons:
                clipped = triangulate_polygon(polygon)
                candy_triangles.extend(clipped)
                contact_candy_triangles += len(clipped)

    if contact_candy_triangles < 20:
        raise ValueError("Contact patch selection is unexpectedly small")

    output_positions = np.asarray(position_rows, dtype=np.float32)
    output_normals = np.asarray(normal_rows, dtype=np.float32)
    output_uvs = np.asarray(uv_rows, dtype=np.float32)
    return (
        np.asarray(base_triangles, dtype=np.int64),
        np.asarray(candy_triangles, dtype=np.int64),
        output_positions,
        output_normals,
        output_uvs,
        {
            "contact_component_triangles": target_count,
            "contact_source_triangles": contact_source_triangles,
            "contact_candy_triangles": contact_candy_triangles,
            "added_vertices": int(len(output_positions) - len(positions)),
        },
    )

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

    legacy_front_boundary_mask = (
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
    if legacy_front_boundary_mask.sum() != 5:
        raise ValueError("Expected exactly five legacy front boundary triangles")
    # The clipped contact patch supersedes these coarse whole-triangle fills.
    front_boundary_fill_mask = np.zeros_like(legacy_front_boundary_mask)

    lower_cap_mask = find_lower_candy_cap(indices, positions, normals, uvs)
    candy_mask = shell_mask | lower_cap_mask

    if shell_mask.sum() < 4000 or lower_cap_mask.sum() < 1000:
        raise ValueError("Candy surface selection is unexpectedly small")
    if np.any(shell_mask & lower_cap_mask):
        raise ValueError("Candy shell and lower cap selections unexpectedly overlap")

    (
        base_triangles,
        candy_triangles,
        output_positions,
        output_normals,
        output_uvs,
        contact_details,
    ) = split_contact_patch(triangles, candy_mask, positions, normals, uvs)
    maximum_index = max(int(base_triangles.max()), int(candy_triangles.max()))
    if maximum_index > np.iinfo(base.COMPONENT_DTYPES[component_type]).max:
        component_type = 5125

    attributes = {
        "POSITION": append_attribute_accessor(document, binary_chunk, output_positions, "VEC3"),
        "NORMAL": append_attribute_accessor(document, binary_chunk, output_normals, "VEC3"),
        "TEXCOORD_0": append_attribute_accessor(document, binary_chunk, output_uvs, "VEC2"),
    }
    base_accessor = base.append_index_accessor(
        document,
        binary_chunk,
        base_triangles,
        component_type,
    )
    candy_accessor = base.append_index_accessor(
        document,
        binary_chunk,
        candy_triangles,
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
    base_primitive["attributes"] = attributes
    base_primitive["indices"] = base_accessor
    candy_primitive = dict(primitive)
    candy_primitive["attributes"] = attributes
    candy_primitive["indices"] = candy_accessor
    candy_primitive["material"] = candy_material_index
    meshes[0]["name"] = "Color_Otter"
    meshes[0]["primitives"] = [base_primitive, candy_primitive]

    candy_points = output_positions[np.unique(candy_triangles)]
    return {
        "source_triangles": int(len(triangles)),
        "output_triangles": int(len(base_triangles) + len(candy_triangles)),
        "source_vertices": int(len(positions)),
        "output_vertices": int(len(output_positions)),
        "candy_component_triangles": connected_details["triangles"],
        "candy_shell_triangles": int(shell_mask.sum()),
        "candy_shell_extension_triangles": int((surface_extension_mask & ~uv_core_mask).sum()),
        "candy_front_boundary_fill_triangles": int(front_boundary_fill_mask.sum()),
        "candy_lower_cap_triangles": int(lower_cap_mask.sum()),
        "candy_material_triangles": int(len(candy_triangles)),
        "base_material_triangles": int(len(base_triangles)),
        "candy_bounds_min": candy_points.min(axis=0).astype(float).tolist(),
        "candy_bounds_max": candy_points.max(axis=0).astype(float).tolist(),
        "uv_center": CANDY_UV_CENTER.astype(float).tolist(),
        "uv_radii": CANDY_UV_RADII.astype(float).tolist(),
        **contact_details,
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
