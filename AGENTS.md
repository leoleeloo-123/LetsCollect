# Agent Operating Notes

Read `docs/START_HERE.md` first.

This repository has replaced its single-file 3D demo with the current React + Vite product architecture for Let's Collect. Do not migrate frameworks or replace the current application entry unless a document records the reason, impact, validation plan, and rollback path.

Current rules:

- Treat the root `index.html` and `src/` application as the current product entry.
- The retired single-file Hero is no longer kept in the working tree; recover it from Git commit `d34f28c` only when a documented rollback requires it.
- Keep GLB assets optimized before deploy.
- Keep model paths, product data, and future API access out of page-level code as the refactor proceeds.
- Prefer small commits: audit/docs, directories, config, styles, ThreeViewer extraction, then pages.

