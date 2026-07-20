from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


SCRIPT = Path(__file__).with_name("build-color-cat-mask-v004.py")
SPEC = spec_from_file_location("color_cat_mask_v004", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT}")

mask_v004 = module_from_spec(SPEC)
SPEC.loader.exec_module(mask_v004)
mask_builder = mask_v004.mask_builder

# Only the two principal inner-ear islands affect the visible ear faces. Two
# tiny pink atlas fragments project onto the coat and tail, so they must remain
# colorizable instead of being included in the protection mask.
mask_builder.EAR_RECTS = (
    (0.445, 0.095, 0.565, 0.185),
    (0.765, 0.300, 0.860, 0.380),
)


if __name__ == "__main__":
    mask_builder.main()
