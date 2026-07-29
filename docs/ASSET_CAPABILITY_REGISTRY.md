# Asset and Capability Registry

Status: current product contract
Last verified: 2026-07-29

## Purpose

This document records which 3D assets and rendering capabilities are available
to the current product, which ones are retained only for rollback or internal
experiments, and which ones are roadmap ideas without a shippable asset.

The presence of a file, type union member, Lab route, archived implementation,
or material prototype does not make a capability available to the C-end
product. Product pages, mock profiles, Echo fixtures, campaigns, and Agent
output must use only entries marked `available`.

## Sources of truth

The executable sources of truth are:

- `src/features/toys/catalog.ts`: model IDs, runtime paths, palette IDs,
  framing, recolor mode, masks, and named material targets;
- `src/features/toys/activeSeries.ts`: active series membership, material
  labels and palette membership;
- `src/features/collect/collectSeries.ts`: the current Collect shelf,
  explicit theme membership, palette policy, and ticket cost;
- `src/features/toys/generator.ts`: draw selection, generated metadata, and
  appearance signatures;
- `src/three/ToyViewer/ToyViewer.tsx`: product 3D loading and application of
  the registered recolor contract;
- `src/three/material/createColor*Materials.ts`: model-specific matte-series
  recolor implementations;

- `src/three/ThumbnailRenderer/renderer.ts`: thumbnail rendering, which must
  mirror the live viewer's model and recolor contract.

This document is the human-readable product contract. If it disagrees with
runtime code, stop product work, verify the intended behavior, and update code
and documentation together. Do not infer availability by scanning
`public/models/`, `assets/models/`, `ToyModelId`, or `ToyMaterialId`.

The executable catalog, draw sources, human-readable registry, and
`src/config/capabilityRegistry.ts` now share the same twenty-four-model roster.

## Availability vocabulary

| Status | Meaning | C-end and campaign use |
| --- | --- | --- |
| `available` | Runtime asset and product path are approved now | Allowed |
| `legacy` | Retained for rollback or historical compatibility | Not allowed |
| `experimental` | Internal Lab, prototype, or inactive runtime experiment | Not allowed |
| `planned` | Roadmap direction without a complete current capability | Not allowed |
| `unavailable` | Explicitly outside the current product contract | Not allowed |

## Available now: Color Animals V3

The active regular series is `series_color_animals`. It contains exactly twenty-four
mobile-first matte models. The internal material ID is `plastic`; the product label
is `柔雾树脂` / soft matte resin. The series has one shared nine-color palette,
but each model applies a selected colorway only to its approved recolor target.
“Colorway” does not always mean body color.

Both `modelUrl` and `mobileModelUrl` currently resolve to the runtime GLB shown
below for these twenty-four entries.

| Product name | Model ID | Runtime GLB | GLB bytes | Approved recolor target | Runtime implementation |
| --- | --- | --- | ---: | --- | --- |
| Color Otter / 水獭 | `color-otter` | `/models/toys/color-otter/model-mobile-v008.glb` | 359,492 | Lollipop only; otter body and authored face colors stay unchanged | Clone the named `Lollipop_Color` material, remove its color map, and set its PBR color directly; no mask |
| Color Bird / 小鸟 | `color-bird` | `/models/toys/color-bird/model-mobile-v002.glb` | 295,428 | Crown only; head, body, wings, eyes, beak, blush, feet, and every other authored color stay unchanged | Standard `color-accessory-mask` path using `/models/toys/color-bird/crown-mask-mobile-v001.webp` (4,292 bytes), an encoded exact-face/shared-edge/proximity topology mask (59,958 bytes), an original gold texture gate, and a tight local crown gate |
| Color Penguin / 企鹅 | `color-penguin` | `/models/toys/color-penguin/model-mobile-v003.glb` | 322,324 | Earmuff top and cup only; feathers, face, blush, beak, feet, eyes, white pads, emblem, and other authored details stay unchanged | Standard `color-accessory-mask` path using `/models/toys/color-penguin/accessory-mask-mobile-v003.webp` (7,914 bytes) and a topology-zone triangle mask (59,966 bytes) |
| Color Bunny / 小兔 | `color-bunny` | `/models/toys/color-bunny/model-mobile-v002.glb` | 381,284 | Suitcase only; bunny body and face stay in authored colors | `onBeforeCompile` protection shader plus `/models/toys/color-bunny/protect-mask-mobile-v001.webp` (52,372 bytes) |
| Color Cat / 小猫 | `color-cat` | `/models/toys/color-cat/model-mobile-v002.glb` | 656,900 | Yarn ball only; cat body, face, ears, paws, and blush stay in authored colors | Apply an `onBeforeCompile` recolor shader only to the named `color_cat_new_yarn` material; no mask |
| Color Panda / 熊猫 | `color-panda` | `/models/toys/color-panda/model-mobile-v002.glb` | 430,628 | Hat only; panda body, markings, face, and blush stay in authored colors | `onBeforeCompile` protection shader plus `/models/toys/color-panda/hat-mask-mobile-v001.webp` (6,024 bytes) |
| Color Bear Singer / 爆炸头小熊 | `color-bear-singer` | `/models/toys/color-bear-singer/model-mobile-v006.glb` | 1,375,744 | Afro only; face, ears and body stay authored | `onBeforeCompile` afro shader plus `/models/toys/color-bear-singer/afro-mask-mobile-v001.webp` (11,540 bytes) |
| Color Dog Camera / 摄像小狗 | `color-dog-camera` | `/models/toys/color-dog-camera/model-mobile-v001.glb` | 372,848 | Hat and camera bag | `onBeforeCompile` accessory shader plus `/models/toys/color-dog-camera/accessory-mask-mobile-v001.webp` (13,820 bytes) |
| Color Dog Drum / 鼓手小狗 | `color-dog-drum` | `/models/toys/color-dog-drum/model-mobile-v001.glb` | 373,540 | Validated drum region | `onBeforeCompile` semantic texture/position shader; no extra mask |
| Color Seal / 海豹 | `color-seal` | `/models/toys/color-seal/model-mobile-v001.glb` | 319,576 | Starfish prop only | `onBeforeCompile` starfish shader plus two compact masks totaling 21,658 bytes |
| Color Karpy / 饭团 Karpy | `color-karpy` | `/models/toys/color-karpy/model-mobile-v001.glb` | 315,240 | Red beret only; Karpy, rice ball, clothing, face, paws, and blush stay authored | `onBeforeCompile` hat shader plus `/models/toys/color-karpy/hat-mask-mobile-v001.webp` (18,474 bytes), red-UV selection, and a local upper-head gate |
| Color Koala / 睡觉考拉 | `color-koala` | `/models/toys/color-koala/model-mobile-v001.glb` | 335,136 | Sleeping-hat body only; pom-pom, koala, branch, leaves, and other props stay authored | `onBeforeCompile` hat shader plus `/models/toys/color-koala/hat-mask-mobile-v001.webp` (9,014 bytes), targeted UV protection, and a local hat-height gate |
| Color Racoon / 糖葫芦浣熊 | `color-racoon` | `/models/toys/color-racoon/model-mobile-v001.glb` | 327,400 | Tanghulu only | Accessory mask plus local position gates |
| Color Hamster / 雪糕仓鼠 | `color-hamster-icecream` | `/models/toys/color-hamster-icecream/model-mobile-v001.glb` | 231,128 | Ice cream only | Accessory mask plus local position gates |
| Color Dino / 围巾恐龙 | `color-dino` | `/models/toys/color-dino/model-mobile-v001.glb` | 255,936 | Scarf only | Accessory mask plus local position gates |
| Color Fox / 羽毛帽狐狸 | `color-fox` | `/models/toys/color-fox/model-mobile-v001.glb` | 247,540 | Hat and feather | Two-channel mask plus local hat and feather gates |
| Color Deer / 蝴蝶结小鹿 | `color-deer` | `/models/toys/color-deer/model-mobile-v001.glb` | 236,804 | Bow and approved accessories | Accessory mask plus semantic connected-component bow protection |
| Color Sheep / 披风小羊 | `color-sheep` | `/models/toys/color-sheep/model-mobile-v001.glb` | 267,280 | Cape and bow | Two-channel accessory mask plus source-color protection |
| Color Sloth / 针织帽树懒 | `color-sloth` | `/models/toys/color-sloth/model-mobile-v001.glb` | 293,836 | Knit hat only | Hat mask shader |
| Color Owl / 博士猫头鹰 | `color-owl` | `/models/toys/color-owl/model-mobile-v001.glb` | 323,444 | Academic hat and book pieces | Academic accessory mask shader |
| Color Duck / 浴缸小鸭 | `color-duck` | `/models/toys/color-duck/model-mobile-v001.glb` | 317,252 | Bathtub pieces; foam remains clean | Bath mask plus dedicated foam-cleanup mask |
| Color Guinea Pig / 气球豚鼠 | `color-guinea-pig` | `/models/toys/color-guinea-pig/model-mobile-v001.glb` | 309,868 | Three balloons share one selected color | Joint UV mask plus semantic balloon geometry zones |
| Color Black Cat / 黑盒猫猫 | `color-black-cat` | `/models/toys/color-black-cat/model-mobile-v001.glb` | 359,448 | Fish logo only | Logo mask plus local position gates |
| Color Cool Wolf / 酷酷狼人 | `color-cool-wolf` | `/models/toys/color-cool-wolf/model-mobile-v001.glb` | 349,456 | Ear studs only | Stud mask plus local position gates |

The twenty-four regular GLBs total 9,072,412 bytes. Their selected runtime masks
total 473,428 bytes. Color Bear Singer v006 is a documented 1.376 MB exception
to the normal 1 MB mobile target and remains an optimization follow-up.

### Shared regular colorways

Every active Color Animal accepts every one of these nine primary palette IDs.
The visible target differs by model as recorded above.

| Palette ID | Product name | Base color |
| --- | --- | --- |
| `cocoa` | 可可曲奇 | `#9d6d54` |
| `apricot` | 蜂蜜杏 | `#d99052` |
| `cream-rose` | 玫瑰奶霜 | `#db7f91` |
| `berry` | 蓝莓汽水 | `#788bd1` |
| `candy-mint` | 薄荷奶糖 | `#6fba9f` |
| `grape` | 葡萄软糖 | `#a47ac2` |
| `coral` | 珊瑚落日 | `#df785f` |
| `lime` | 青柠果冻 | `#9db660` |
| `sky` | 晴空棉花 | `#69a9c8` |

The current local draw branch has an absolute probability of 100%. The twenty-four
models are uniform and the nine primary palette IDs are selected independently
and uniformly:

- each regular model has an absolute probability of `100% / 24`, approximately
  4.1667%;
- each regular model-and-primary-palette combination has an absolute
  probability of `100% / 216`, approximately 0.4630%.
## Fully offline archives: Jelly Jade and two crystal studies

Jelly Jade, Diamond Unicorn, and Diamond Dog are archive material, not current
runtime or compatibility assets. Their GLBs are stored only under
`assets/models/archive/{toy-slug}/`; no active ID, palette, route, preload, or
viewer branch resolves them.

| Retired family | Archived payloads | Browser/runtime status |
| --- | --- | --- |
| Jelly Jade (six runtime groups) | `assets/models/archive/jelly-jade-*/` | Offline; not deployed or loaded |
| Diamond Unicorn | `assets/models/archive/diamond-unicorn/` | Offline; not deployed or loaded |
| Diamond Dog | `assets/models/archive/diamond-dog/` | Offline; not deployed or loaded |

Per-folder manifests record byte sizes, SHA-256 identities, and restore paths.
Historical local items from these families are filtered by the active-state
loader; the application does not promise compatibility rendering.
## Current runtime capabilities## Current runtime capabilities

| Capability | Availability | Boundary |
| --- | --- | --- |
| Load and inspect the twenty-four active matte-series GLBs | `available` | Shared `ToyViewer`; local Draco decoder |
| Apply the nine registered model-specific colorways | `available` | Only the approved target for each model may change |
| Resolve a retired Jelly Jade or Diamond runtime | `unavailable` | Payloads are local-only archives; restoration requires a new implementation decision |
| Draw from the thirteen registered special series | `available` | Explicit members, random registered matte colorway, six tickets per draw |
| Client-side V3 mock draw | `available` | Old `/draw` uses the twenty-four regular models only; not an authoritative server draw |
| Persist the demo collection and recent draws | `available` | Browser local storage; not cloud ownership |
| Render cached collection thumbnails from real GLBs | `available` | 320 px WebP, serialized render queue, IndexedDB cache |
| Live 3D collection detail | `available` | One selected item at a time |
| Favorite and representative selection | `available` | Browser-local demo state; up to three Representatives |
| Collection Signature | `available` | Deterministic local derivation from real collection and preference signals |
| Echo recommendations and shared collection tasks | `available` | Finite, explainable local Demo; not production multi-user matching |
| Server-authoritative draw, tickets, and collection | `planned` | Current Supabase use covers anonymous Auth/Profile only |

## Legacy, experimental, and planned boundaries

### Legacy

- The earlier Jelly Jade model family and palettes are fully offline under
  `assets/models/archive/`; their IDs and rendering branches are absent from
  active code.
- The eight-material prototype catalog, including wood and metal treatments,
  remains implementation history. A material ID or prototype implementation
  is not evidence that the material is currently collectible.
- The former generic Color Dog and the retired Color Cat v001 are archived
  assets. The dedicated Camera Dog and Drum Dog listed above are current
  product models.
- Color Teddy was a temporary full-coat recoloring test. Its source, runtime,
  mask, builder, and dedicated Lab/material code are archived locally and
  ignored by Git; no current code or browser URL references it.
- Diamond Unicorn and Diamond Dog sources and runtimes are fully offline under
  `assets/models/archive/`; old local items and internal Labs are no longer
  supported by the active application.

### Experimental

- Color Unicorn recolor experiments under `assets/models/archive/` are not an
  active Companion or a second crystal exhibit.
- `public/models/toys/color-otter/model-mobile-v024.glb` is an inactive
  experiment. The product uses v008.
- Color Animal and crystal-model Lab routes are internal validation surfaces.
  A Lab option does not automatically become a C-end capability.

### Planned

The following are roadmap capabilities only until separately approved assets,
metadata, rendering contracts, and validation exist:

- Sleepy assets beyond the registered Cat, Seal, and Koala poses, plus Quirky,
  Bold, and Cool archetypes;
- expansion of Cute and other animal shapes;
- crystal Companions beyond the registered Unicorn and Dog;
- fuzzy, metallic, and porcelain material families;
- additional palettes outside the registered nine regular colorways and five
  native crystal tints;
- richer shared collection missions and rewards.

No current C-end page, mock profile, Agent reason, or campaign may describe
these planned entries as drawable, collectible, owned, or unlocked.

## Capability and campaign feasibility

Every proposal must list `requiredCapabilities`, `eligibleAssets`, and a
feasibility result. Availability and feasibility are different: an available
asset can still require product or service engineering for a new use.

| Feasibility | Rule | Publish behavior |
| --- | --- | --- |
| `available_now` | Uses only `available` assets and already implemented controls without changing the runtime contract | May proceed only after human approval |
| `requires_configuration` | Uses only `available` assets, but needs controlled copy, weights, duration, audience, reward, or campaign configuration | May proceed only after the configuration is reviewed and a human approves it |
| `requires_engineering` | Needs a missing state field, service, UI flow, adapter, validation path, or runtime behavior | Cannot publish |
| `requires_asset_creation` | Needs a new model, texture, mask, material family, palette, animation, or other unapproved art asset | Cannot publish |

Additional enforcement rules:

1. `available_now` and `requires_configuration` may reference only asset IDs
   and palette IDs marked `available` in this registry and active runtime code.
2. Any `legacy`, `experimental`, `planned`, or `unavailable` dependency blocks
   publishing and must be named in `blockingReasons`.
3. A proposal involving an unregistered Sleepy pose, Quirky, metallic, fuzzy,
   porcelain, a crystal Companion beyond the registered pair, or a new color
   is at least `requires_asset_creation`. The registered sleeping Cat, Seal,
   and Koala may be used without creating a new asset.
4. The current local Favorite, Representative, Collection Signature, and Echo
   Demo may be referenced as implemented. Cloud ownership, production
   multi-user Echo, or server-authoritative draws remain
   `requires_engineering` until implemented and registered.
5. Changing draw weights is never an implicit UI action. It requires explicit
   configuration, versioned probability disclosure, human approval, and, for
   authoritative operation, trusted server-side execution.
6. Agent output must be structured and traceable to registered IDs. It must
   not invent a model, palette, material, recolor target, or ownership fact.

## Change control

When adding or changing an asset capability:

1. update the runtime asset and its versioned path;
2. update `catalog.ts` and the relevant active-series configuration;
3. update the live viewer and thumbnail renderer together;
4. verify the exact recolor target, protected details, loading, error behavior,
   narrow mobile rendering, reveal, persistence, collection thumbnail, and 3D
   detail;
5. update this registry, the relevant asset source notes, and the rollout
   document in the same intended change set;
6. keep the previous known-good asset and configuration available for a
   documented rollback.
