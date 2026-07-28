import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-sloth"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "hat-mask-mobile-v001.webp"
MASK_SIZE = 1024


def read_base_texture() -> Image.Image:
    with MODEL.open("rb") as glb:
        magic, version, _ = struct.unpack("<4sII", glb.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"Unsupported GLB header in {MODEL}")

        json_length, json_type = struct.unpack("<II", glb.read(8))
        if json_type != 0x4E4F534A:
            raise ValueError(f"Missing JSON chunk in {MODEL}")
        document = json.loads(glb.read(json_length))

        _, binary_type = struct.unpack("<II", glb.read(8))
        if binary_type != 0x004E4942:
            raise ValueError(f"Missing binary chunk in {MODEL}")
        binary_start = glb.tell()

        material = document["materials"][0]
        texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
        texture = document["textures"][texture_index]
        source_index = texture.get("extensions", {}).get("EXT_texture_webp", {}).get(
            "source", texture.get("source")
        )
        if source_index is None:
            raise ValueError("Base-color texture has no image source")

        image = document["images"][source_index]
        view = document["bufferViews"][image["bufferView"]]
        glb.seek(binary_start + view.get("byteOffset", 0))
        image_bytes = glb.read(view["byteLength"])

    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def ramp(value: float, start: float, width: float) -> float:
    return max(0.0, min(1.0, (value - start) / width))


def remove_small_components(mask: Image.Image, min_area: int = 3000) -> Image.Image:
    width, height = mask.size
    source = mask.load()
    output = Image.new("L", mask.size, 0)
    target = output.load()
    visited = bytearray(width * height)

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or source[x, y] < 18:
                continue

            visited[index] = 1
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            while stack:
                current_x, current_y = stack.pop()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or source[next_x, next_y] < 18:
                        continue
                    visited[next_index] = 1
                    stack.append((next_x, next_y))

            if len(component) >= min_area:
                for component_x, component_y in component:
                    target[component_x, component_y] = 255

    return output

def build_mask() -> tuple[Image.Image, float]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    hsv = base.convert("HSV")
    seed = Image.new("L", base.size, 0)
    dark_red = Image.new("L", base.size, 0)
    source = base.load()
    source_hsv = hsv.load()
    seed_target = seed.load()
    dark_red_target = dark_red.load()

    for y in range(MASK_SIZE):
        for x in range(MASK_SIZE):
            red, green, blue = source[x, y]
            hue, saturation, value = source_hsv[x, y]

            # The knitted hat is the only authored magenta material. Requiring
            # blue to remain above green rejects the sloth's warm beige and
            # brown fur even where those colors have a similar red channel.
            rgb_strength = min(
                ramp(red - green, 34.0, 54.0),
                ramp(blue - green, 1.0, 28.0),
                ramp(red, 62.0, 72.0),
            )

            # Deep knitted folds can wrap from magenta back through red and
            # were previously left visible after a cyan/green recolor. The
            # high-hue branch fills all magenta folds. The low-hue red branch
            # is kept separate and admitted only when it is spatially adjacent
            # to an already-confirmed hat texel, protecting red/brown details
            # elsewhere in the atlas.
            magenta_hue_strength = min(
                ramp(hue, 222.0, 16.0),
                ramp(saturation, 24.0, 56.0),
                ramp(value, 18.0, 45.0),
            )
            seed_value = round(255 * max(rgb_strength, magenta_hue_strength))
            seed_target[x, y] = seed_value

            wrapped_red_strength = min(
                1.0 - ramp(hue, 2.0, 5.0),
                ramp(saturation, 110.0, 80.0),
                ramp(value, 18.0, 45.0),
                ramp(red - green, 15.0, 40.0),
            )
            dark_red_target[x, y] = round(255 * wrapped_red_strength)

    support = seed.point(lambda pixel: 255 if pixel >= 18 else 0)
    support = support.filter(ImageFilter.MaxFilter(31))
    mask = ImageChops.lighter(seed, ImageChops.multiply(dark_red, support))
    mask = mask.filter(ImageFilter.MaxFilter(5))
    mask = remove_small_components(mask)
    mask = mask.filter(ImageFilter.MinFilter(5))
    active = sum(mask.get_flattened_data())
    return mask, active / (255 * MASK_SIZE * MASK_SIZE)

def main() -> None:
    mask, coverage = build_mask()
    mask.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} "
        f"({OUTPUT.stat().st_size} bytes, {coverage:.1%} hat coverage)"
    )


if __name__ == "__main__":
    main()
