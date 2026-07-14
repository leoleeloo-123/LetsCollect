# Directory Structure

This project is small today, so the target structure should be created
gradually. Do not create large empty trees just for appearance.

## Important Paths

```text
C:\Users\licunhongyu\Desktop\LetsCollect
|-- index.html
|-- package.json
|-- README.md
|-- AGENTS.md
|-- .env.example
|-- .gitattributes
|-- assets/
|   `-- models/source/
|       `-- jelly-jade-kitty/model-source-v001.glb
|-- docs/
|-- legacy/hero-prototype/
|-- playbooks/
|   `-- model-asset-pipeline.md
|-- public/
|   |-- draco/
|   `-- models/toys/
|       `-- jelly-jade-unicorn/model-web-v001.glb
|-- scripts/
|-- src/
|-- supabase/
|-- tests/
`-- vercel.json
```

GitHub:

`https://github.com/leoleeloo-123/LetsCollect`

Production:

`https://lets-collect.vercel.app/`

## Current React Structure

```text
src/
|-- app/
|-- components/
|   |-- cards/
|   |-- feedback/
|   |-- layout/
|   |-- three-viewer/
|   `-- ui/
|-- data/mock/
|-- features/
|-- pages/
|   |-- auth/
|   |-- collection/
|   |-- draw/
|   |-- friends/
|   |-- home/
|   `-- not-found/
|-- services/
|-- styles/
|-- three/ToyViewer/
`-- types/
```

## Asset Responsibilities

- `assets/models/source/`: source or high-quality model assets, tracked with Git LFS.
- `public/models/toys/`: optimized runtime GLB files served to browsers.
- `public/draco/`: Draco decoder files used by `ToyViewer`.
- `playbooks/`: repeatable operational workflows such as model compression and QA.

## Migration Map

- `legacy/hero-prototype/` preserves the old HTML prototype as reference only.
- `public/models/toys/jelly-jade-unicorn/model-web-v001.glb` is the current production runtime model.
- `assets/models/source/jelly-jade-kitty/model-source-v001.glb` is a new source model waiting for optimization.
- `src/three/ToyViewer/` owns Three.js rendering, loading, interaction, and disposal.
- `src/data/mock/toys.ts` owns current model URLs and toy variants.

## Directory Responsibilities

- `docs/`: project handoff, architecture, roadmap, model guide, and change history.
- `playbooks/`: standardized repeatable workflows.
- `assets/`: non-runtime source assets and high-quality originals.
- `public/`: deployable static assets.
- `src/pages/`: page composition.
- `src/components/`: reusable UI components.
- `src/three/`: Three.js engine-level logic.
- `src/services/`: API and Supabase boundaries.
- `src/data/`: mock and static product data.
- `scripts/`: asset optimization and validation tooling.
- `tests/`: smoke, integration, and model loading tests.
