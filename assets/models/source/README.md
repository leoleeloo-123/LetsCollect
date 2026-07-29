# Source Model Intake

Each toy has one canonical folder:

```text
assets/models/source/{toy-slug}/
|-- model-source-v001.glb
`-- notes.md
```

Source GLBs are local-only rebuild inputs. They are ignored by Git and must
never be imported by React, Three.js, or a browser URL. The canonical source
area is reserved for current formal models; retired families belong under
`assets/models/archive/{toy-slug}/source/` with a tracked archive manifest.

When a new GLB arrives:

1. Choose the final lowercase kebab-case toy slug.
2. Move the raw file directly into that toy folder.
3. Rename it to `model-source-v001.glb`.
4. Record its original filename, size, SHA-256, geometry, textures, and import
   date in `notes.md`.
5. Generate optimized runtime files under
   `public/models/toys/{toy-slug}/`.
6. Record the exact build command and active runtime version in `notes.md`.
7. Remove any byte-identical copy left in the repository root or named
   `model-original-drop.glb`.

If a genuinely different source arrives, keep the old source only when it is
needed for rollback:

```text
assets/models/source/{toy-slug}/model-source-v002.glb
assets/models/archive/{toy-slug}/source/model-source-v001.glb
```

Do not create empty source or runtime directories as placeholders. Known source
gaps are tracked in `assets/models/README.md`.
