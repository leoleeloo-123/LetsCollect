# Development Guide

## Current Approach

The formal product shell uses React + Vite + TypeScript. The retired
single-file HTML Hero has been removed from the working tree after the React
replacement and is available only through Git history.

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
- Treat the root `index.html` and `src/` application as the active entry.
- Extract before expanding: ThreeViewer, data, config, styles, then pages.
- Restore the retired single-file Hero from commit `d34f28c` only for a
  documented rollback or historical comparison.
- Avoid adding Three.js into page components before the ToyViewer boundary is defined.

## Verification Checklist

For each meaningful change:

- Page loads locally.
- Console has no relevant errors.
- GLB path resolves.
- Desktop interaction works.
- Mobile layout is checked when UI changes.
- Vercel route still resolves.
