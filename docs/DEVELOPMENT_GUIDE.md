# Development Guide

## Current Approach

The formal product shell now uses React + Vite + TypeScript. The production legacy HTML entry remains active until the React shell is promoted through a separate deployment step.

## Local React Development

Use bundled or system Node with pnpm:

```powershell
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

If using the Codex bundled runtime, ensure the bundled Node directory is on `PATH` before running scripts that need `node`.

## Change Strategy

- Keep changes small and documented.
- Preserve the working hero page until a replacement is verified.
- Extract before expanding: ThreeViewer, data, config, styles, then pages.
- Avoid adding product logic directly inside `hero-jelly-jade-toy.html`.
- Avoid adding Three.js into page components before the ToyViewer boundary is defined.

## Verification Checklist

For each meaningful change:

- Page loads locally.
- Console has no relevant errors.
- GLB path resolves.
- Desktop interaction works.
- Mobile layout is checked when UI changes.
- Vercel route still resolves.
