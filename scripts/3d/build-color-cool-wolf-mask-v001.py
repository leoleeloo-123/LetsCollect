"""Build the Color Cool Wolf ear-stud recolor mask.

First unpack the optimized runtime GLB:

    pnpm dlx @gltf-transform/cli copy \
      public/models/toys/color-cool-wolf/model-mobile-v001.glb \
      C:/tmp/color-cool-wolf-inspect-20260727/model.gltf
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = (
    ROOT
    / "public"
    / "models"
    / "toys"
    / "color-cool-wolf"
    / "ear-stud-mask-mobile-v001.webp"
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


def build_magenta_pixel_mask(texture: np.ndarray) -> Image.Image:
    sampled = texture.astype(np.int16)
    red = sampled[:, :, 0]
    green = sampled[:, :, 1]
    blue = sampled[:, :, 2]

    magenta = (
        (red >= 40)
        & (red - green >= 16)
        & (blue - green >= 2)
        & (red - blue >= -25)
    )
    return (
        Image.fromarray(magenta.astype(np.uint8) * 255, mode="L")
        .filter(ImageFilter.GaussianBlur(0.35))
    )


def build_mask(unpacked: Path) -> tuple[Image.Image, int]:
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

    magenta_samples = (
        (sampled[:, :, 0] >= 140)
        & (sampled[:, :, 0] - sampled[:, :, 1] >= 70)
        & (sampled[:, :, 0] - sampled[:, :, 2] >= -20)
        & (sampled[:, :, 2] - sampled[:, :, 1] >= 20)
    )
    authored_magenta = magenta_samples.sum(axis=1) >= 2
    ear_studs = (
        authored_magenta
        & (centroids[:, 0] >= 0.33)
        & (centroids[:, 0] <= 0.41)
        & (centroids[:, 1] >= 0.45)
        & (centroids[:, 1] <= 0.61)
        & (centroids[:, 2] >= 0.15)
        & (centroids[:, 2] <= 0.24)
    )

    logo_channel = build_magenta_pixel_mask(texture)
    empty = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    return Image.merge("RGB", (logo_channel, empty, empty)), int(ear_studs.sum())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--unpacked",
        type=Path,
        default=Path(r"C:\tmp\color-cool-wolf-inspect-20260727"),
    )
    args = parser.parse_args()
    mask, triangle_count = build_mask(args.unpacked)
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, ear-stud triangles={triangle_count})"
    )


if __name__ == "__main__":
    main()
