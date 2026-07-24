# Asset and Capability Registry

Status: current product contract
Last verified: 2026-07-24

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
  labels, palette membership, and the Diamond Unicorn branch probability;
- `src/features/toys/generator.ts`: draw selection, generated metadata, and
  appearance signatures;
- `src/three/ToyViewer/ToyViewer.tsx`: product 3D loading and application of
  the registered recolor contract;
- `src/three/material/createColor*Materials.ts`: model-specific matte-series
  recolor implementations;
- `src/three/material/createDiamondUnicornMaterial.ts`: Diamond Unicorn tint
  and faceted material implementation;
- `src/three/ThumbnailRenderer/renderer.ts`: thumbnail rendering, which must
  mirror the live viewer's model and recolor contract.

This document is the human-readable product contract. If it disagrees with
runtime code, stop product work, verify the intended behavior, and update code
and documentation together. Do not infer availability by scanning
`public/models/`, `assets/models/`, `ToyModelId`, or `ToyMaterialId`.

## Availability vocabulary

| Status | Meaning | C-end and campaign use |
| --- | --- | --- |
| `available` | Runtime asset and product path are approved now | Allowed |
| `legacy` | Retained for rollback or historical compatibility | Not allowed |
| `experimental` | Internal Lab, prototype, or inactive runtime experiment | Not allowed |
| `planned` | Roadmap direction without a complete current capability | Not allowed |
| `unavailable` | Explicitly outside the current product contract | Not allowed |

## Available now: Color Animals V3

The active regular series is `series_color_animals`. It contains exactly ten
mobile-first matte models. The internal material ID is `plastic`; the product label
is `柔雾树脂` / soft matte resin. The series has one shared nine-color palette,
but each model applies a selected colorway only to its approved recolor target.
“Colorway” does not always mean body color.

Both `modelUrl` and `mobileModelUrl` currently resolve to the runtime GLB shown
below for these ten entries.

| Product name | Model ID | Runtime GLB | GLB bytes | Approved recolor target | Runtime implementation |
| --- | --- | --- | ---: | --- | --- |
| Color Otter / 水獭 | `color-otter` | `/models/toys/color-otter/model-mobile-v008.glb` | 359,492 | Lollipop only; otter body and authored face colors stay unchanged | Clone the named `Lollipop_Color` material, remove its color map, and set its PBR color directly; no mask |
| Color Bird / 小鸟 | `color-bird` | `/models/toys/color-bird/model-mobile-v001.glb` | 310,308 | Main body uses the selected palette; cap uses a deterministic accent palette derived from the selected palette and appearance seed; eyes, beak, feet, and blush remain protected | `onBeforeCompile` zone shader plus `/models/toys/color-bird/protect-mask-mobile-v014.webp` (17,840 bytes) and semantic geometry zones |
| Color Teddy / 小熊 | `color-teddy` | `/models/toys/color-teddy/model-mobile-v001.glb` | 356,132 | Coat/body; facial details, muzzle, and blush remain protected | `onBeforeCompile` protection shader plus `/models/toys/color-teddy/protect-mask-mobile-v001.webp` (7,404 bytes) |
| Color Bunny / 小兔 | `color-bunny` | `/models/toys/color-bunny/model-mobile-v002.glb` | 381,284 | Suitcase only; bunny body and face stay in authored colors | `onBeforeCompile` protection shader plus `/models/toys/color-bunny/protect-mask-mobile-v001.webp` (52,372 bytes) |
| Color Cat / 小猫 | `color-cat` | `/models/toys/color-cat/model-mobile-v002.glb` | 656,900 | Yarn ball only; cat body, face, ears, paws, and blush stay in authored colors | Apply an `onBeforeCompile` recolor shader only to the named `color_cat_new_yarn` material; no mask |
| Color Panda / 熊猫 | `color-panda` | `/models/toys/color-panda/model-mobile-v002.glb` | 430,628 | Hat only; panda body, markings, face, and blush stay in authored colors | `onBeforeCompile` protection shader plus `/models/toys/color-panda/hat-mask-mobile-v001.webp` (6,024 bytes) |
| Color Bear Singer / 爆炸头小熊 | `color-bear-singer` | `/models/toys/color-bear-singer/model-mobile-v006.glb` | 1,375,744 | Afro only; face, ears and body stay authored | `onBeforeCompile` afro shader plus `/models/toys/color-bear-singer/afro-mask-mobile-v001.webp` (11,540 bytes) |
| Color Dog Camera / 摄像小狗 | `color-dog-camera` | `/models/toys/color-dog-camera/model-mobile-v001.glb` | 372,848 | Hat and camera bag | `onBeforeCompile` accessory shader plus `/models/toys/color-dog-camera/accessory-mask-mobile-v001.webp` (13,820 bytes) |
| Color Dog Drum / 鼓手小狗 | `color-dog-drum` | `/models/toys/color-dog-drum/model-mobile-v001.glb` | 373,540 | Validated drum region | `onBeforeCompile` semantic texture/position shader; no extra mask |
| Color Seal / 海豹 | `color-seal` | `/models/toys/color-seal/model-mobile-v001.glb` | 319,576 | Starfish prop only | `onBeforeCompile` starfish shader plus two compact masks totaling 21,658 bytes |

The ten regular GLBs total 4,936,452 bytes. Their runtime masks total
130,658 bytes. Color Bear Singer v006 is a documented 1.376 MB exception to
the normal 1 MB mobile target and remains an optimization follow-up.

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

The regular draw branch has an absolute probability of 95%. Within that
branch, the ten models are uniform and the nine primary palette IDs are
selected independently and uniformly:

- each regular model has an absolute probability of `95% / 10`, or 9.5%;
- each regular model-and-primary-palette combination has an absolute
  probability of `95% / 90`, approximately 1.0556%.

## Available now: two crystal special exhibits

There are exactly two active crystal-family Companions:

| Product name | Model ID | Series | Runtime GLB | GLB bytes | Material and recolor |
| --- | --- | --- | --- | ---: | --- |
| Diamond Unicorn / 钻石独角兽 | `diamond-unicorn` | `series_special_exhibits` | `/models/toys/diamond-unicorn/model-mobile-v001.glb` | 174,984 | One shared faceted `MeshPhysicalMaterial` with runtime tint; no texture, mask, or per-color model replacement |
| Diamond Dog / 水晶小狗 | `diamond-dog` | `series_special_exhibits` | `/models/toys/diamond-dog/model-mobile-v001.glb` | 344,052 | Reuses the shared faceted material and runtime tint; no texture or mask |

The internal material ID is `crystal`; the current product label is
`切面钻石`. The two assets form the explicit Crystal series. They are not
members of the ten-model matte series or matte atlas.

The special-exhibit branch has an absolute draw probability of 5%. It selects
one of the two crystal models uniformly and one of five uniform runtime tints.
Each model/tint pair therefore has an absolute compatibility-draw probability of 0.5%:

| Palette ID | Product name | Base tint | Absolute draw probability |
| --- | --- | --- | ---: |
| `diamond-clear` | 无色钻 | `#e8f3f5` | 1% across both models |
| `diamond-ice` | 冰蓝钻 | `#9fd6df` | 1% across both models |
| `diamond-rose` | 樱粉钻 | `#e4aac1` | 1% across both models |
| `diamond-champagne` | 香槟钻 | `#d7c18c` | 1% across both models |
| `diamond-mint` | 薄荷钻 | `#a5cfbe` | 1% across both models |

The Collect Color series additionally allows both crystal models to consume
one of the nine regular palette values as a runtime tint. This is a configured
use of the same material, not a new texture, GLB, or material family.

## Current runtime capabilities

| Capability | Availability | Boundary |
| --- | --- | --- |
| Load and inspect the ten active matte-series GLBs | `available` | Shared `ToyViewer`; local Draco decoder |
| Apply the nine registered model-specific colorways | `available` | Only the approved target for each model may change |
| Load and inspect Diamond Unicorn and Diamond Dog | `available` | Shared crystal material; series cards use thumbnails |
| Apply five native crystal tints | `available` | Same material contract on both crystal models |
| Apply nine Color-series tints to crystal models | `available` | Runtime tint only; used by the explicit 12-model Color pool |
| Client-side V3 mock draw | `available` | 95% regular / 5% special; not an authoritative server draw |
| Persist the demo collection and recent draws | `available` | Browser local storage; not cloud ownership |
| Render cached collection thumbnails from real GLBs | `available` | 320 px WebP, serialized render queue, IndexedDB cache |
| Live 3D collection detail | `available` | One selected item at a time |
| Favorite and representative selection | `planned` | No current state or ownership metadata |
| Collection Signature | `planned` | Must be derived from real collection signals |
| Echo recommendations and shared collection tasks | `planned` | Must use available assets and explainable signals |
| Server-authoritative draw, tickets, and collection | `planned` | Current Supabase use covers anonymous Auth/Profile only |

## Legacy, experimental, and planned boundaries

### Legacy

- The earlier Jelly Jade model family (`unicorn`, `kitty`, `bunny`, `bird`,
  `doggy`, and `karpy`) and its palettes remain a rollback path. They are not
  members of the active V3 draw pool.
- The eight-material prototype catalog, including wood and metal treatments,
  remains implementation history. A material ID or prototype implementation
  is not evidence that the material is currently collectible.
- The former generic Color Dog and the retired Color Cat v001 are archived
  assets. The dedicated Camera Dog and Drum Dog listed above are current
  product models.

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

- Sleepy, Quirky, Bold, and Cool archetypes;
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
3. A proposal involving Sleepy, Quirky, metallic, fuzzy, porcelain, a crystal
   Companion beyond the registered pair, or a new color is at least
   `requires_asset_creation`.
4. A proposal involving Favorite, Representative Companions, Echo, Collection
   Signature, cloud ownership, or server-authoritative draws remains
   `requires_engineering` until the corresponding capability is implemented
   and this registry is updated.
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
