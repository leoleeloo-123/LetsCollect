import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def shift_slices(offset: int, size: int) -> tuple[slice, slice]:
    if offset < 0:
        return slice(-offset, size), slice(0, size + offset)
    if offset > 0:
        return slice(0, size - offset), slice(offset, size)
    return slice(0, size), slice(0, size)


def pad_skin_texture(source: Path, output: Path, iterations: int) -> int:
    image = Image.open(source).convert("RGB")
    pixels = np.asarray(image, dtype=np.uint8).copy()
    height, width, _ = pixels.shape

    red = pixels[:, :, 0].astype(np.int16)
    green = pixels[:, :, 1].astype(np.int16)
    blue = pixels[:, :, 2].astype(np.int16)
    skin = (
        (red > 150)
        & (green > 95)
        & (blue > 55)
        & ((red - green) > 7)
        & ((green - blue) > -4)
    )
    dark = pixels.max(axis=2) < 92
    filled = 0

    for _ in range(iterations):
        color_sum = np.zeros((height, width, 3), dtype=np.uint32)
        neighbor_count = np.zeros((height, width), dtype=np.uint16)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            source_y, target_y = shift_slices(dy, height)
            source_x, target_x = shift_slices(dx, width)
            valid = skin[source_y, source_x]
            color_sum[target_y, target_x] += (
                pixels[source_y, source_x].astype(np.uint32) * valid[:, :, None]
            )
            neighbor_count[target_y, target_x] += valid

        candidates = dark & (neighbor_count > 0)
        if not candidates.any():
            break
        averaged = color_sum[candidates] // neighbor_count[candidates, None]
        pixels[candidates] = averaged.astype(np.uint8)
        skin[candidates] = True
        dark[candidates] = False
        filled += int(candidates.sum())

    output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(pixels, "RGB").save(output, "PNG", optimize=True)
    return filled


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Pad Color Bear Singer skin UV islands into adjacent dark atlas pixels."
    )
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--iterations", type=int, default=8)
    args = parser.parse_args()

    filled = pad_skin_texture(args.source, args.output, args.iterations)
    print(f"Wrote {args.output} with {filled} padded pixels")


if __name__ == "__main__":
    main()
