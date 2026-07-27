import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-bear-singer"
MODEL = RUNTIME_DIR / "model-mobile-v001.glb"
OUTPUT = RUNTIME_DIR / "afro-mask-mobile-v001.webp"
MASK_SIZE = 512
MIN_COMPONENT_AREA = 1000


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


def find_components(active: bytearray) -> list[list[int]]:
    width = MASK_SIZE
    height = MASK_SIZE
    visited = bytearray(width * height)
    components: list[list[int]] = []

    for start in range(width * height):
        if not active[start] or visited[start]:
            continue
        visited[start] = 1
        stack = [start]
        component: list[int] = []
        while stack:
            index = stack.pop()
            component.append(index)
            x = index % width
            y = index // width
            if x > 0:
                neighbor = index - 1
                if active[neighbor] and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if x + 1 < width:
                neighbor = index + 1
                if active[neighbor] and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if y > 0:
                neighbor = index - width
                if active[neighbor] and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
            if y + 1 < height:
                neighbor = index + width
                if active[neighbor] and not visited[neighbor]:
                    visited[neighbor] = 1
                    stack.append(neighbor)
        components.append(component)
    return components


def build_mask() -> tuple[Image.Image, list[int]]:
    base = read_base_texture().resize(
        (MASK_SIZE, MASK_SIZE), Image.Resampling.LANCZOS
    )
    active = bytearray(MASK_SIZE * MASK_SIZE)
    for index, (red, green, blue) in enumerate(base.get_flattened_data()):
        brightest = max(red, green, blue)
        darkest = min(red, green, blue)
        neutral_dark = brightest < 112 and brightest - darkest < 42
        active[index] = 1 if neutral_dark else 0

    components = find_components(active)
    retained = [component for component in components if len(component) >= MIN_COMPONENT_AREA]
    mask_data = bytearray(MASK_SIZE * MASK_SIZE)
    for component in retained:
        for index in component:
            mask_data[index] = 255

    mask = Image.frombytes("L", (MASK_SIZE, MASK_SIZE), bytes(mask_data))
    mask = mask.filter(ImageFilter.MaxFilter(5))
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))
    empty = Image.new("L", mask.size, 0)
    sizes = sorted((len(component) for component in retained), reverse=True)
    return Image.merge("RGB", (mask, empty, empty)), sizes


def main() -> None:
    mask, component_sizes = build_mask()
    mask.save(OUTPUT, "WEBP", quality=94, method=6)
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes); "
        f"retained {len(component_sizes)} components: {component_sizes}"
    )


if __name__ == "__main__":
    main()
