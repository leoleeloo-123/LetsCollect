import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-dog"
ARCHIVE_DIR = ROOT / "assets" / "models" / "archive" / "color-dog" / "protect-masks"
MODEL = RUNTIME_DIR / "model-mobile-v002.glb"
SOURCE_MASK = ARCHIVE_DIR / "protect-mask-mobile-v015.webp"
OUTPUT_MASK = RUNTIME_DIR / "protect-mask-mobile-v027.webp"


def read_base_texture() -> Image.Image:
    with MODEL.open("rb") as glb:
        glb.read(12)
        json_length, _ = struct.unpack("<II", glb.read(8))
        document = json.loads(glb.read(json_length))
        glb.read(8)
        binary_start = glb.tell()
        source_index = document["textures"][0]["extensions"]["EXT_texture_webp"]["source"]
        buffer_view = document["bufferViews"][document["images"][source_index]["bufferView"]]
        glb.seek(binary_start + buffer_view.get("byteOffset", 0))
        image_bytes = glb.read(buffer_view["byteLength"])
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def main() -> None:
    base = read_base_texture().resize((512, 512), Image.Resampling.LANCZOS)
    mask = Image.open(SOURCE_MASK).convert("RGB")
    red, green, blue = mask.split()
    iris_fragment = Image.new("L", mask.size, 0)
    base_pixels = base.load()
    fragment_pixels = iris_fragment.load()

    # The mobile GLB splits the screen-left iris across a small third UV island
    # beside the muzzle. Protect only its authored brown/black pixels; excluding
    # atlas background and pale face pixels prevents a visible seam or halo.
    for y in range(45, 126):
        for x in range(318, 364):
            red_value, green_value, blue_value = base_pixels[x, y]
            luma = 0.2126 * red_value + 0.7152 * green_value + 0.0722 * blue_value
            if 12 < luma < 150:
                fragment_pixels[x, y] = 255

    red = ImageChops.lighter(red, iris_fragment)
    Image.merge("RGB", (red, green, blue)).save(OUTPUT_MASK, "WEBP", lossless=True, method=6)


if __name__ == "__main__":
    main()
