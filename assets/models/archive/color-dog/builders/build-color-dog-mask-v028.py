from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
RUNTIME_DIR = ROOT / "public" / "models" / "toys" / "color-dog"
SOURCE_MASK = RUNTIME_DIR / "protect-mask-mobile-v027.webp"
OUTPUT_MASK = RUNTIME_DIR / "protect-mask-mobile-v028.webp"

# Pixel-space regions in the 512px atlas. They cover only the three split eye
# islands and the nose; the mouth and coat boundary are deliberately excluded.
CLOSE_REGIONS = (
    (310, 35, 370, 135),
    (400, 0, 470, 50),
    (370, 450, 440, 512),
    (370, 64, 410, 103),
)


def close_pinholes(channel: Image.Image, region: tuple[int, int, int, int]) -> Image.Image:
    crop = channel.crop(region)
    closed = crop.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    channel.paste(ImageChops.lighter(crop, closed), region)
    return channel


def main() -> None:
    mask = Image.open(SOURCE_MASK).convert("RGB")
    red, green, blue = mask.split()
    for region in CLOSE_REGIONS:
        red = close_pinholes(red, region)
    Image.merge("RGB", (red, green, blue)).save(OUTPUT_MASK, "WEBP", lossless=True, method=6)


if __name__ == "__main__":
    main()
