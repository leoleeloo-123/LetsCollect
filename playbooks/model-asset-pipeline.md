# 3D Toy Model Asset Pipeline

This playbook standardizes how new collectible toy models move from raw GLB to
frontend-ready draw assets.

The goal is consistency: every small toy should feel like it belongs to the same
collectible system, load quickly on mobile, and remain easy to swap in
`ToyViewer`.

## Folder Contract

```text
assets/models/source/{toy-slug}/
  model-source-v001.glb          # raw or high quality source, local only
  notes.md                       # required provenance and rebuild notes

public/models/toys/{toy-slug}/
  model-web-v001.glb             # default frontend model
  model-mobile-v001.glb          # optional lighter mobile model
  model-preview-v001.glb         # optional very small catalog preview

assets/models/archive/{toy-slug}/
  ...                            # superseded experiments, never browser-served
```

## Raw Asset Intake

Do not leave newly delivered GLBs in the repository root.

1. Create `assets/models/source/{toy-slug}/`.
2. Move the delivered file to
   `assets/models/source/{toy-slug}/model-source-v001.glb`.
3. Add `notes.md` with the original filename, import date, byte size, SHA-256,
   geometry and texture summary, intended recoloring scope, and rebuild command.
4. Build runtime assets into `public/models/toys/{toy-slug}/`.
5. Remove byte-identical copies such as a root-level raw GLB or
   `model-original-drop.glb`.

When a later delivery is genuinely different, version it as
`model-source-v002.glb`. Move superseded source versions to
`assets/models/archive/{toy-slug}/source/` only when they are required for
rollback and document why they are retained.

Do not create empty source or runtime directories as placeholders.

Current source model area:

```text
assets/models/source/{color-*,diamond-*,jelly-jade-*}/model-source-v*.glb
```

Current runtime model area:

```text
public/models/toys/{color-*,diamond-*,jelly-jade-*}/model-*.glb
```

The active runtime version for each model is declared in
`src/features/toys/catalog.ts`; directory presence alone does not make an asset
active.

Only files under `public/` are served to the browser. Source files under
`assets/` are for editing, audit, and re-export.

Keep `public/models/toys/{toy-slug}/` limited to files referenced by the active
catalog or a documented cache-safe rollback. Move intermediate masks and unused
runtime experiments to `assets/models/archive/`.

## Naming Rules

- Toy slug: lowercase kebab-case, for example `jelly-jade-kitty`.
- Source file: `model-source-v001.glb`.
- Runtime file: `model-web-v001.glb`.
- Mobile-specific file: `model-mobile-v001.glb`.
- Do not overwrite a shipped runtime model without increasing the version.
- Superseded runtime files may remain for cache-safe rollbacks, but the catalog
  must reference only the active version.

## Visual Consistency Checklist

Before compression, make sure the model follows the collectible style:

- Cute blind-box proportions: large head, compact body, soft limbs.
- Rounded silhouette, no thin spikes or fragile details.
- Jelly jade material direction: translucent, glossy, softly colored.
- Similar perceived scale to existing unicorn in `ToyViewer`.
- Origin near the center bottom or model center, with predictable rotation.
- No embedded cameras or lights required by the frontend.
- No unused high-poly hidden meshes.
- No giant texture maps unless they are visually essential.

## Runtime Budgets

Use these as first-pass targets:

```text
Preview/catalog model: <= 500 KB
Mobile draw model:     <= 1.5 MB preferred, <= 2 MB max
Default web model:     <= 2.5 MB preferred, <= 4 MB max
Desktop inspect model: <= 5 MB only when the quality gain is obvious
```

Geometry guidance:

```text
Preview: <= 10k triangles
Mobile:  <= 50k triangles
Web:     <= 100k triangles
Inspect: <= 100k triangles only for hero-quality models
```

Texture guidance:

```text
Mobile: 1024px max per texture
Web:    1024-2048px max per texture
Use WebP or KTX2/Basis when texture-heavy.
Avoid shipping unused textures, baked lights, or editor metadata.
```

## Recommended Tools

Install nothing permanently at first. Use `npx` so the repo stays light:

```bash
npx @gltf-transform/cli@latest inspect assets/models/source/jelly-jade-kitty/model-source-v001.glb
```

For deeper inspection, use:

- Blender for visual/source cleanup.
- glTF-Transform CLI for prune, dedup, resize, Draco, and validation.
- Chrome DevTools network panel for actual load time.
- The app's `/draw` route for mobile interaction QA.

## Standard Optimization Flow

1. Inspect the source model:

```bash
npx @gltf-transform/cli@latest inspect assets/models/source/{toy-slug}/model-source-v001.glb
```

2. Create the runtime folder:

```bash
mkdir -p public/models/toys/{toy-slug}
```

On PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path public/models/toys/{toy-slug}
```

3. Export a web model with Draco compression:

```bash
npx @gltf-transform/cli@latest optimize \
  assets/models/source/{toy-slug}/model-source-v001.glb \
  public/models/toys/{toy-slug}/model-web-v001.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024
```

4. If mobile load is still slow, create a lighter mobile version:

```bash
npx @gltf-transform/cli@latest optimize \
  assets/models/source/{toy-slug}/model-source-v001.glb \
  public/models/toys/{toy-slug}/model-mobile-v001.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 768 \
  --simplify
```

For the current dense, texture-free source toys (about two million triangles),
use explicit V1 ratios and inspect the result rather than accepting the default
simplifier:

```bash
npx @gltf-transform/cli@latest optimize \
  public/models/toys/{toy-slug}/model-web-v001.glb \
  public/models/toys/{toy-slug}/model-mobile-v001.glb \
  --compress draco \
  --simplify true \
  --simplify-ratio 0.05 \
  --simplify-error 0.003 \
  --texture-compress false
```

Use ratio `0.05` for the 100k Web target and `0.025` for the 50k Mobile target.
These ratios are starting points, not universal presets. Reject the export if
the silhouette, eyes, horn, ears, or other identity-defining features collapse.

5. Inspect the optimized files:

```bash
npx @gltf-transform/cli@latest inspect public/models/toys/{toy-slug}/model-web-v001.glb
npx @gltf-transform/cli@latest inspect public/models/toys/{toy-slug}/model-mobile-v001.glb
```

6. Wire the model through data/config, not directly inside page components.

For the current app, model URLs and framing overrides live in:

```text
src/features/toys/catalog.ts
```

7. Run local verification:

```bash
pnpm typecheck
pnpm build
pnpm dev
```

Then verify:

- `/` loads without blocking on the model.
- `/draw` shows the toy and no blank canvas.
- Mobile viewport loads the first visible model in about 2 seconds or less.
- Drag/rotate remains smooth.
- Browser console has no GLTF, Draco, or WebGL errors.

## Draco Runtime Contract

The frontend decoder path is:

```text
public/draco/
```

`ToyViewer` expects Draco decoder files to be available at:

```text
/draco/draco_wasm_wrapper.js
/draco/draco_decoder.wasm
```

Do not move these without updating `src/three/ToyViewer/ToyViewer.tsx` and
`src/three/ToyViewer/runtime.ts`.

## QA Acceptance

Before committing a new runtime model, capture these facts in the PR or commit
notes:

```text
Toy slug:
Source path:
Runtime path:
Source GLB size:
Optimized GLB size:
Triangle count:
Texture count and max size:
Desktop /draw first visual:
Mobile /draw first visual:
Known compromises:
```

Minimum acceptance:

- Runtime file is under the size budget.
- Model is centered and scaled similarly to the unicorn.
- No severe clipping in `ToyViewer`.
- Mobile load and drag are acceptable.
- Existing routes still build.

## Git Rules

- Source `.glb` files in `assets/models/source/**/*.glb` are local-only and ignored by Git.
- Runtime `.glb` files in `public/models/toys/` should remain normal Git files
  when they are small enough for deployment.
- Do not commit Blender autosaves, unpacked texture folders, or unused exports.
- If a runtime file exceeds 5 MB, treat that as a model optimization issue
  before shipping it.
