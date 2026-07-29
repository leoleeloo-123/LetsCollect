# Public Assets

Deployable static assets live here. Only files required by the current browser
application belong under `public/`; editable sources and retired exports belong
under `assets/models/`.

## Current model runtime

`public/models/toys/` contains exactly the twenty-four formal Color Animals:

```text
color-otter
color-bird
color-penguin
color-bunny
color-cat
color-panda
color-bear-singer
color-dog-camera
color-dog-drum
color-seal
color-karpy
color-koala
color-racoon
color-hamster-icecream
color-dino
color-fox
color-deer
color-sheep
color-sloth
color-owl
color-duck
color-guinea-pig
color-black-cat
color-cool-wolf
```

Jelly Jade, Diamond Unicorn, and Diamond Dog runtimes were removed from
`public/models/toys/` on 2026-07-29. Their local-only payloads and SHA-256
manifests are under `assets/models/archive/{toy-slug}/`; they are not deployed,
preloaded, registered, or supported as stored-item compatibility.

Other deployable asset roots include:

```text
public/images/toys/
public/images/series/
public/icons/
public/favicon/
public/draco/
```

Model convention:

```text
public/models/toys/{toy-slug}/model-web-v001.glb
public/models/toys/{toy-slug}/model-mobile-v001.glb
public/models/toys/{toy-slug}/model-preview-v001.glb
```

Model URLs are registered in `src/features/toys/catalog.ts`. Do not hard-code
new model paths in pages or viewer components, and do not keep unreferenced
rollback GLBs under `public/`.