# 3D Model Asset Inventory

This directory owns editable source assets and rollback history. Nothing under
`assets/models/` is requested by the browser.

## Canonical Layout

```text
assets/models/
|-- source/
|   `-- {toy-slug}/
|       |-- model-source-v001.glb
|       `-- notes.md
`-- archive/
    `-- {toy-slug}/

public/models/toys/
`-- {toy-slug}/
    |-- model-mobile-v001.glb
    `-- *.webp
```

- `source/` contains the high-resolution input used to rebuild runtime assets.
  Source GLBs are local-only and ignored by Git.
- `archive/` contains superseded experiments, masks, builders, and rollback
  history. Archived files must never be referenced by production URLs.
- `public/models/toys/` contains only optimized browser runtime assets and
  masks.
- Raw GLB drops must not remain in the repository root.

The source version identifies the actual input asset. Do not retain
`model-original-drop.glb` beside `model-source-v001.glb` when both files are
byte-identical.

## Active Matte Source Coverage

| Toy slug | Canonical source | Active runtime |
| --- | --- | --- |
| `color-otter` | `model-source-v001.glb` | `model-mobile-v008.glb` |
| `color-bird` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-teddy` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-bunny` | `model-source-v001.glb` | `model-mobile-v002.glb` |
| `color-cat` | `model-source-v002.glb` | `model-mobile-v002.glb` |
| `color-panda` | `model-source-v001.glb` | `model-mobile-v002.glb` |
| `color-bear-singer` | `model-source-v001.glb` | `model-mobile-v006.glb` |
| `color-dog-camera` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-dog-drum` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-seal` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-karpy` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-koala` | `model-source-v001.glb` | `model-mobile-v001.glb` |

## Additional Source Coverage

| Toy slug | Source status | Runtime status |
| --- | --- | --- |
| `color-racoon` | `model-source-v001.glb` present | Mobile runtime and mask present |
| `color-penguin` | `model-source-v001.glb` present | Experimental Lab mobile runtime and three-channel accessory mask present; still adjusting |
| `color-sheep` | `model-source-v001.glb` present | Experimental Lab mobile runtime and mask present |
| `color-sloth` | `model-source-v001.glb` present | Experimental Lab mobile runtime and hat mask present |
| `color-owl` | `model-source-v001.glb` present | Experimental Lab mobile runtime and academic mask present |
| `color-duck` | `model-source-v001.glb` present | Experimental Lab mobile runtime and bath mask present |
| `color-guinea-pig` | `model-source-v001.glb` present | Experimental Lab mobile runtime and three-balloon zone mask present |


| `jelly-jade-bird` | `model-source-v001.glb` present | Legacy runtime present |
| `jelly-jade-bunny` | `model-source-v001.glb` present | Legacy runtime present |
| `jelly-jade-doggy` | `model-source-v001.glb` present | Legacy runtime present |
| `jelly-jade-karpy` | `model-source-v001.glb` present | Legacy runtime present |
| `jelly-jade-kitty` | `model-source-v001.glb` present | Legacy runtime present |
| `jelly-jade-unicorn` | Source GLB missing | Legacy runtime present |

The remaining missing source GLB is a known legacy gap. Do not infer that a runtime
GLB is the editable source unless that provenance is documented.

## Archived Crystal Studies

| Toy slug | Archived source | Compatibility runtime |
| --- | --- | --- |
| `diamond-dog` | `assets/models/archive/diamond-dog/source/` | Retained for historical local collections and the internal Lab |
| `diamond-unicorn` | `assets/models/archive/diamond-unicorn/source/` (notes only) | Retained for historical local collections and the internal Lab |

Neither crystal model is active or eligible for a new draw.

## Required Notes

Every new source folder should include `notes.md` with:

- import date and original filename;
- source byte size and SHA-256;
- geometry and embedded texture summary;
- active runtime path and version;
- optimization and mask build commands;
- recolorable and protected regions;
- known compromises and rollback files.

See `playbooks/model-asset-pipeline.md` for the complete intake and runtime
workflow.
