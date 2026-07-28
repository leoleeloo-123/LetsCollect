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
|   `-- models/
|       |-- source/{toy-slug}/model-source-v001.glb
|       `-- archive/{toy-slug}/
|-- docs/
|-- legacy/hero-prototype/
|-- playbooks/
|   |-- model-asset-pipeline.md
|   `-- collectible-generation-architecture.md
|-- public/
|   |-- draco/
|   `-- models/toys/
|       `-- jelly-jade-*/model-{web,mobile}-v*.glb
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
|   |-- collectibles/
|   |-- feedback/
|   |-- layout/
|   |-- three-viewer/
|   `-- ui/
|-- data/mock/
|-- features/
|   `-- toys/
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

- `assets/models/source/`: local-only source or high-quality model assets, ignored by Git.
- `assets/models/archive/`: superseded experiments retained for rollback; never served to browsers.
- `public/models/toys/`: optimized runtime GLB files served to browsers.
- `public/draco/`: Draco decoder files used by `ToyViewer`.
- `playbooks/`: repeatable operational workflows such as model compression and QA.

## Migration Map

- `legacy/hero-prototype/` preserves the old HTML prototype as reference only.
- `public/models/toys/color-*/` contains the active matte runtimes plus the
  experimental Color Penguin Lab runtime; product availability still comes
  from the catalog and asset registry, not folder presence.
- `public/models/toys/jelly-jade-*/` contains legacy compatibility runtimes and
  is not part of the active draw pool.
- `assets/models/source/*/model-source-v001.glb` contains local source assets that are not pushed.
- `src/three/ToyViewer/` owns Three.js rendering, loading, interaction, and disposal.
- `src/features/toys/catalog.ts` owns model URLs, palettes, and transparency grades.
- `src/features/toys/generator.ts` owns current V3 demo collectible generation.

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
