# Source Assets

This folder stores non-runtime source assets and local rollback history for
Let's Collect. Nothing under `assets/` is requested directly by the browser.

## Model areas

```text
assets/models/source/
  color-*/
    model-source-v*.glb
assets/models/archive/
  {retired-toy-slug}/
    README.md
    source/          # optional, local-only
    runtime/         # optional, local-only
```

The five available Jelly Jade source inputs, all six Jelly Jade runtime groups,
and both Diamond runtime groups are fully offline under `assets/models/archive/`.
Jelly Jade Unicorn has no retained standalone source GLB. Archive manifests
record sizes, hashes, previous paths, and restore requirements.

## Rules

- Keep active source GLBs under `assets/models/source/`; move retired source and runtime payloads to `assets/models/archive/{toy-slug}/`.
- Do not reference `assets/` paths from React, Three.js, HTML preload code, or production URLs.
- Export only current optimized runtime models to `public/models/toys/{toy-slug}/`.
- Keep each active source toy in its own slug folder and add a tracked top-level `README.md` to every archived toy.
- Preserve versioned filenames and SHA-256 manifests so rollback material stays traceable.