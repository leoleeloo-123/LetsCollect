# Agent Operating Notes

Read `docs/START_HERE.md` first.

This repository is moving from a single-file 3D demo toward a maintainable product architecture for Let's Collect. Do not rewrite the working hero page or migrate frameworks unless a document records the reason, impact, validation plan, and rollback path.

Current rules:

- Preserve `hero-jelly-jade-toy.html` behavior until a migration step explicitly replaces it.
- Do not commit the untracked local legacy `index.html` unless the user asks.
- Keep GLB assets optimized before deploy.
- Keep model paths, product data, and future API access out of page-level code as the refactor proceeds.
- Prefer small commits: audit/docs, directories, config, styles, ThreeViewer extraction, then pages.

