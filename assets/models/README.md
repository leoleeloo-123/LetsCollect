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
- `archive/` contains local superseded experiments and rollback history.
  Git tracks only top-level archive manifests; payloads are ignored and must
  never be referenced by production URLs.
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
| `color-bird` | `model-source-v002.glb` | `model-mobile-v002.glb` |
| `color-penguin` | `model-source-v003.glb` | `model-mobile-v003.glb` |
| `color-bunny` | `model-source-v001.glb` | `model-mobile-v002.glb` |
| `color-cat` | `model-source-v002.glb` | `model-mobile-v002.glb` |
| `color-panda` | `model-source-v001.glb` | `model-mobile-v002.glb` |
| `color-bear-singer` | `model-source-v001.glb` | `model-mobile-v006.glb` |
| `color-dog-camera` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-dog-drum` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-seal` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-karpy` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-koala` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-racoon` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-hamster-icecream` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-dino` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-fox` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-deer` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-sheep` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-sloth` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-owl` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-duck` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-guinea-pig` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-black-cat` | `model-source-v001.glb` | `model-mobile-v001.glb` |
| `color-cool-wolf` | `model-source-v001.glb` | `model-mobile-v001.glb` |

## Fully Archived Jelly Jade and Crystal Models

| Toy slug | Archived source | Archived runtime | Browser status |
| --- | --- | --- | --- |
| `jelly-jade-bird` | `assets/models/archive/jelly-jade-bird/source/` | `assets/models/archive/jelly-jade-bird/runtime/` | Offline |
| `jelly-jade-bunny` | `assets/models/archive/jelly-jade-bunny/source/` | `assets/models/archive/jelly-jade-bunny/runtime/` | Offline |
| `jelly-jade-doggy` | `assets/models/archive/jelly-jade-doggy/source/` | `assets/models/archive/jelly-jade-doggy/runtime/` | Offline |
| `jelly-jade-karpy` | `assets/models/archive/jelly-jade-karpy/source/` | `assets/models/archive/jelly-jade-karpy/runtime/` | Offline |
| `jelly-jade-kitty` | `assets/models/archive/jelly-jade-kitty/source/` | `assets/models/archive/jelly-jade-kitty/runtime/` | Offline |
| `jelly-jade-unicorn` | Source GLB unavailable | `assets/models/archive/jelly-jade-unicorn/runtime/` | Offline |
| `diamond-dog` | `assets/models/archive/diamond-dog/source/` | `assets/models/archive/diamond-dog/runtime/` | Offline |
| `diamond-unicorn` | Retained notes only | `assets/models/archive/diamond-unicorn/runtime/` | Offline |

The archived payloads are Git-ignored and never browser-served. Each folder's
tracked `README.md` records byte sizes, SHA-256 values, previous paths, and the
restore boundary. The Jelly Jade Unicorn source GLB remains a known provenance
gap; do not infer source status from its runtime exports.
Color Teddy is archived locallyColor Teddy is archived locally under `assets/models/archive/color-teddy/`.
It has no production runtime, catalog entry, draw eligibility, or compatibility
contract.

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
