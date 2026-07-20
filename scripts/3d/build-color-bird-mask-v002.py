from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


SCRIPT = Path(__file__).with_name("build-color-bird-mask-v001.py")
SPEC = spec_from_file_location("color_bird_mask_v001", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_builder = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_builder)

# v002 corrects the UV rectangles after checking the 1024px atlas in-browser.
mask_builder.OUTPUT = mask_builder.RUNTIME_DIR / "protect-mask-mobile-v002.webp"
mask_builder.EYE_RECTS = (
    (0.025, 0.225, 0.135, 0.380),
    (0.660, 0.215, 0.755, 0.380),
)
mask_builder.BEAK_RECTS = ((0.710, 0.205, 0.885, 0.450),)
mask_builder.FOOT_RECTS = (
    (0.235, 0.405, 0.415, 0.585),
    (0.505, 0.425, 0.690, 0.620),
    (0.735, 0.745, 0.930, 0.965),
)
mask_builder.BLUSH_RECTS = (
    (0.070, 0.300, 0.180, 0.445),
    (0.610, 0.055, 0.705, 0.185),
    (0.775, 0.330, 0.900, 0.465),
)


if __name__ == "__main__":
    mask_builder.main()
