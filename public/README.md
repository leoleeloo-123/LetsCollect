# Public Assets

Deployable static assets live here.

Only place assets here when the browser must request them at runtime. Raw or
high-quality source files belong in `assets/models/source/`.

The current runtime model pool contains Web and Mobile GLBs for:

```text
jelly-jade-unicorn
jelly-jade-kitty
jelly-jade-bunny
jelly-jade-bird
jelly-jade-doggy
jelly-jade-karpy
```

The active mobile-first Color Animals pool is:

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

Archived compatibility runtimes, excluded from all new draws, are:

```text
diamond-unicorn
diamond-dog
```

```text
public/models/toys/
public/images/toys/
public/images/series/
public/icons/
public/favicon/
```

Model convention:

```text
public/models/toys/{toy-slug}/model-web-v001.glb
public/models/toys/{toy-slug}/model-mobile-v001.glb
public/models/toys/{toy-slug}/model-preview-v001.glb
```

Model URLs are registered in `src/features/toys/catalog.ts`. Do not hard-code
new model paths in pages or viewer components.
