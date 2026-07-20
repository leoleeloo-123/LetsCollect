from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


SCRIPT = Path(__file__).with_name("build-color-cat-mask-v004.py")
SPEC = spec_from_file_location("color_cat_mask_v004_final", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

# v005 proved that the two tiny inner-ear UV fragments are required to avoid a
# visible unprotected strip at the ear base. The active v006 result therefore
# returns to v004 and records geometry gating as an integration requirement.
mask_v004 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v004)
mask_builder = mask_v004.mask_builder


if __name__ == "__main__":
    mask_builder.main()
