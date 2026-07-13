# Directory Structure

This project is small today, so the target structure should be created gradually. Do not create large empty trees just for appearance.

## Current Important Paths

```text
C:\Users\licunhongyu\Desktop\LetsCollect
├── index.html
├── package.json
├── public/draco/
├── public/models/toys/jelly-jade-unicorn/model-web-v001.glb
├── legacy/hero-prototype/
├── src/
├── vercel.json
├── README.md
├── AGENTS.md
├── .env.example
└── docs/
```

GitHub:

`https://github.com/leoleeloo-123/LetsCollect`

Production:

`https://lets-collect.vercel.app/`

## Current React Structure

```text
src/
├── app/
├── components/
│   ├── cards/
│   ├── feedback/
│   ├── layout/
│   ├── three-viewer/
│   └── ui/
├── data/mock/
├── pages/
│   ├── auth/
│   ├── collection/
│   ├── draw/
│   ├── friends/
│   ├── home/
│   ├── not-found/
│   └── auth/
├── features/
├── styles/
├── three/ToyViewer/
└── types/
```

## Target Near-Term Structure

```text
LetsCollect/
├── public/
│   ├── models/
│   │   └── toys/
│   └── images/
│       └── toys/
├── src/
│   ├── components/
│   │   └── three-viewer/
│   ├── config/
│   ├── data/
│   ├── pages/
│   │   └── home/
│   ├── services/
│   ├── styles/
│   ├── three/
│   └── utils/
├── docs/
├── scripts/
└── tests/
```

## Migration Map

- `legacy/hero-prototype/` preserves the current working prototype as a reference.
- `public/models/toys/jelly-jade-unicorn/model-web-v001.glb` is the current production model asset.
- `src/three/ToyViewer/` owns Three.js rendering, loading, interaction, and disposal.
- `src/data/mock/toys.ts` owns the model URL and visual variants.

## Directory Responsibilities

- `docs/`: project handoff, architecture, roadmap, model guide, and change history.
- `public/`: deployable static assets once assets are migrated.
- `src/pages/`: page composition.
- `src/components/`: reusable UI components.
- `src/three/`: Three.js engine-level logic.
- `src/services/`: API and Supabase boundaries.
- `src/data/`: mock and static product data.
- `src/config/`: centralized paths and feature flags.
- `scripts/`: asset optimization and validation tooling.
- `tests/`: future smoke, integration, and model loading tests.
