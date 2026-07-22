"""Split the Color Otter lollipop head into a dedicated glTF material.

The input must be an uncompressed GLB. Use glTF-Transform `copy` first when
the runtime source uses Draco, then run the normal optimize step on the output.
"""

from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path

import numpy as np


COMPONENT_DTYPES = {
    5121: np.dtype("<u1"),
    5123: np.dtype("<u2"),
    5125: np.dtype("<u4"),
    5126: np.dtype("<f4"),
}
TYPE_WIDTHS = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
}


def read_glb(path: Path) -> tuple[dict, bytearray]:
    payload = path.read_bytes()
    magic, version, total_length = struct.unpack_from("<4sII", payload, 0)
    if magic != b"glTF" or version != 2 or total_length != len(payload):
        raise ValueError(f"Unsupported GLB header: {path}")

    offset = 12
    json_chunk = None
    binary_chunk = bytearray()
    while offset < len(payload):
        chunk_length, chunk_type = struct.unpack_from("<II", payload, offset)
        offset += 8
        chunk = payload[offset : offset + chunk_length]
        offset += chunk_length
        if chunk_type == 0x4E4F534A:
            json_chunk = json.loads(chunk.decode("utf-8").rstrip(" \t\r\n\x00"))
        elif chunk_type == 0x004E4942:
            binary_chunk = bytearray(chunk)

    if json_chunk is None:
        raise ValueError(f"Missing JSON chunk: {path}")
    return json_chunk, binary_chunk


def write_glb(path: Path, document: dict, binary_chunk: bytearray) -> None:
    while len(binary_chunk) % 4:
        binary_chunk.append(0)
    document["buffers"][0]["byteLength"] = len(binary_chunk)
    json_bytes = json.dumps(document, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((-len(json_bytes)) % 4)
    total_length = 12 + 8 + len(json_bytes) + 8 + len(binary_chunk)
    payload = bytearray(struct.pack("<4sII", b"glTF", 2, total_length))
    payload.extend(struct.pack("<II", len(json_bytes), 0x4E4F534A))
    payload.extend(json_bytes)
    payload.extend(struct.pack("<II", len(binary_chunk), 0x004E4942))
    payload.extend(binary_chunk)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)


def read_accessor(document: dict, binary_chunk: bytearray, accessor_index: int) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    if "sparse" in accessor:
        raise ValueError("Sparse accessors are not supported by this builder")
    view = document["bufferViews"][accessor["bufferView"]]
    component_type = accessor["componentType"]
    dtype = COMPONENT_DTYPES[component_type]
    width = TYPE_WIDTHS[accessor["type"]]
    count = accessor["count"]
    byte_offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    packed_stride = dtype.itemsize * width
    byte_stride = view.get("byteStride", packed_stride)

    if byte_stride == packed_stride:
        values = np.frombuffer(binary_chunk, dtype=dtype, count=count * width, offset=byte_offset)
        shaped = values.reshape(count, width) if width > 1 else values
        return shaped.copy()

    rows = np.empty((count, width), dtype=dtype)
    for row in range(count):
        start = byte_offset + row * byte_stride
        rows[row] = np.frombuffer(binary_chunk, dtype=dtype, count=width, offset=start)
    return rows


def write_accessor(document: dict, binary_chunk: bytearray, accessor_index: int, values: np.ndarray) -> None:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    dtype = COMPONENT_DTYPES[accessor["componentType"]]
    width = TYPE_WIDTHS[accessor["type"]]
    byte_offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    packed_stride = dtype.itemsize * width
    byte_stride = view.get("byteStride", packed_stride)
    packed_values = np.asarray(values, dtype=dtype).reshape(accessor["count"], width)
    if byte_stride == packed_stride:
        packed = packed_values.tobytes()
        binary_chunk[byte_offset : byte_offset + len(packed)] = packed
    else:
        for row, packed_row in enumerate(packed_values):
            start = byte_offset + row * byte_stride
            binary_chunk[start : start + packed_stride] = packed_row.tobytes()
    if accessor["type"] != "SCALAR":
        accessor["min"] = packed_values.min(axis=0).astype(float).tolist()
        accessor["max"] = packed_values.max(axis=0).astype(float).tolist()


class DisjointSet:
    def __init__(self, count: int) -> None:
        self.parent = np.arange(count, dtype=np.int32)
        self.rank = np.zeros(count, dtype=np.uint8)

    def find(self, value: int) -> int:
        parent = self.parent
        root = value
        while parent[root] != root:
            root = int(parent[root])
        while parent[value] != value:
            next_value = int(parent[value])
            parent[value] = root
            value = next_value
        return root

    def union(self, left: int, right: int) -> None:
        left_root = self.find(left)
        right_root = self.find(right)
        if left_root == right_root:
            return
        if self.rank[left_root] < self.rank[right_root]:
            left_root, right_root = right_root, left_root
        self.parent[right_root] = left_root
        if self.rank[left_root] == self.rank[right_root]:
            self.rank[left_root] += 1


def find_lollipop_triangles(indices: np.ndarray, positions: np.ndarray) -> tuple[np.ndarray, np.ndarray, dict]:
    triangles = indices.reshape(-1, 3).astype(np.int64, copy=False)
    connected = DisjointSet(len(positions))
    for a, b, c in triangles:
        connected.union(int(a), int(b))
        connected.union(int(a), int(c))

    groups: dict[int, list[int]] = {}
    for triangle_index, triangle in enumerate(triangles):
        root = connected.find(int(triangle[0]))
        groups.setdefault(root, []).append(triangle_index)

    target_center = np.array([0.475, 0.265, 0.245], dtype=np.float32)
    candidates = []
    for root, triangle_indices in groups.items():
        component_triangles = triangles[np.asarray(triangle_indices, dtype=np.int64)]
        vertices = np.unique(component_triangles)
        points = positions[vertices]
        minimum = points.min(axis=0)
        maximum = points.max(axis=0)
        center = (minimum + maximum) * 0.5
        extent = maximum - minimum
        distance = float(np.linalg.norm(center - target_center))
        large_enough = bool(np.all(extent > np.array([0.18, 0.18, 0.18])))
        on_lollipop_side = bool(minimum[0] > 0.25 and maximum[1] < 0.50 and minimum[1] > 0.02)
        if large_enough and on_lollipop_side:
            candidates.append((distance, root, triangle_indices, vertices, minimum, maximum, center))

    if not candidates:
        raise ValueError("Could not find the lollipop head connected component")

    _, root, triangle_indices, vertices, minimum, maximum, center = min(candidates, key=lambda item: item[0])
    triangle_mask = np.zeros(len(triangles), dtype=bool)
    triangle_mask[np.asarray(triangle_indices, dtype=np.int64)] = True
    details = {
        "root": int(root),
        "triangles": int(triangle_mask.sum()),
        "vertices": int(len(vertices)),
        "minimum": minimum.tolist(),
        "maximum": maximum.tolist(),
        "center": center.tolist(),
    }
    return triangle_mask, vertices, details


def append_index_accessor(
    document: dict,
    binary_chunk: bytearray,
    indices: np.ndarray,
    component_type: int,
) -> int:
    dtype = COMPONENT_DTYPES[component_type]
    packed = np.asarray(indices, dtype=dtype).reshape(-1).tobytes()
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
            "target": 34963,
        }
    )
    accessor_index = len(document["accessors"])
    flat = np.asarray(indices).reshape(-1)
    document["accessors"].append(
        {
            "bufferView": view_index,
            "componentType": component_type,
            "count": int(len(flat)),
            "type": "SCALAR",
            "min": [int(flat.min())],
            "max": [int(flat.max())],
        }
    )
    return accessor_index


def split_lollipop(document: dict, binary_chunk: bytearray) -> dict:
    meshes = document.get("meshes", [])
    if len(meshes) != 1 or len(meshes[0].get("primitives", [])) != 1:
        raise ValueError("Expected the optimized Color Otter to contain one mesh and one primitive")

    primitive = meshes[0]["primitives"][0]
    index_accessor = document["accessors"][primitive["indices"]]
    component_type = index_accessor["componentType"]
    indices = read_accessor(document, binary_chunk, primitive["indices"])
    positions = read_accessor(document, binary_chunk, primitive["attributes"]["POSITION"])
    triangle_mask, lollipop_vertices, details = find_lollipop_triangles(indices, positions)
    triangles = indices.reshape(-1, 3)

    # Move the candy head away from the cheek while preserving its lower connector.
    candy_y = positions[lollipop_vertices, 1]
    blend = np.clip((candy_y - 0.105) / 0.060, 0.0, 1.0)
    blend = blend * blend * (3.0 - 2.0 * blend)
    positions[lollipop_vertices, 0] += 0.055 * blend
    positions[lollipop_vertices, 2] += 0.010 * blend
    write_accessor(document, binary_chunk, primitive["attributes"]["POSITION"], positions)
    details["maximum_shift"] = [0.055, 0.0, 0.010]

    base_accessor = append_index_accessor(document, binary_chunk, triangles[~triangle_mask], component_type)
    lollipop_accessor = append_index_accessor(document, binary_chunk, triangles[triangle_mask], component_type)

    materials = document.setdefault("materials", [])
    base_material_index = primitive.get("material")
    if base_material_index is not None:
        materials[base_material_index]["name"] = "Otter_Base"
    lollipop_material_index = len(materials)
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
    lollipop_primitive = dict(primitive)
    lollipop_primitive["indices"] = lollipop_accessor
    lollipop_primitive["material"] = lollipop_material_index
    meshes[0]["name"] = "Color_Otter"
    meshes[0]["primitives"] = [base_primitive, lollipop_primitive]
    return details


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    document, binary_chunk = read_glb(args.input)
    details = split_lollipop(document, binary_chunk)
    write_glb(args.output, document, binary_chunk)
    print(json.dumps(details, indent=2))


if __name__ == "__main__":
    main()
