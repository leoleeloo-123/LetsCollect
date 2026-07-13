# Directory Structure

This project is small today, so the target structure should be created gradually. Do not create large empty trees just for appearance.

## Current Important Paths

```text
C:\Users\licunhongyu\Desktop\LetsCollect
├── hero-jelly-jade-toy.html
├── index.html
├── package.json
├── public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb
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

## Current React Shell Structure

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
│   ├── explore/
│   ├── home/
│   ├── not-found/
│   └── profile/
├── styles/
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

- `hero-jelly-jade-toy.html` stays in place as the production legacy entry until the React shell is explicitly promoted.
- `legacy/hero-prototype/` preserves the current working prototype as a reference.
- `public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb` is the current deployed model asset.
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
