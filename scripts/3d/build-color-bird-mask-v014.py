from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


SCRIPT = Path(__file__).with_name("build-color-bird-mask-v005.py")
SPEC = spec_from_file_location("color_bird_mask_v005", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v005 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v005)
mask_builder = mask_v005.mask_builder
mask_builder.OUTPUT = mask_builder.RUNTIME_DIR / "protect-mask-mobile-v014.webp"


if __name__ == "__main__":
    mask_builder.main()
