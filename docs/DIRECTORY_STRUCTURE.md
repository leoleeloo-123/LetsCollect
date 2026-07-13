# Directory Structure

This project is small today, so the target structure should be created gradually. Do not create large empty trees just for appearance.

## Current Important Paths

```text
C:\Users\licunhongyu\Desktop\LetsCollect
├── hero-jelly-jade-toy.html
├── Hitem3d-1783778104845.glb
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

- `hero-jelly-jade-toy.html` stays in place until the new home entry is proven.
- `Hitem3d-1783778104845.glb` should later move to `public/models/toys/` with a descriptive name and version.
- In-page design tokens should later move to `src/styles/tokens.css`.
- In-page variant data should later move to `src/data/toys.js` or `src/data/mock/toys.js`.
- In-page Three.js setup should later move to `src/three/` and `src/components/three-viewer/`.
- `vercel.json` should be updated only after route migration is verified.

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

