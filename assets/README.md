# Source Assets

This folder stores non-runtime source assets for Let's Collect.

Files here are not requested directly by the browser. Runtime assets that the
frontend loads must be exported into `public/`.

## Model Areas

```text
assets/models/source/
  jelly-jade-bird/
    model-source-v001.glb
  jelly-jade-bunny/
    model-source-v001.glb
  jelly-jade-doggy/
    model-source-v001.glb
  jelly-jade-karpy/
    model-source-v001.glb
  jelly-jade-kitty/
    model-source-v001.glb
```

## Rules

- Keep large source `.glb` files in Git LFS.
- Do not reference `assets/` paths from React or Three.js code.
- Export optimized runtime models to `public/models/toys/{toy-slug}/`.
- Keep each source toy in its own slug folder.
- Preserve versioned filenames so old deployments and QA notes stay traceable.
