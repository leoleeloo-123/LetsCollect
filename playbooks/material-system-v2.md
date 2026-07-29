# Material System V2

Status: historical V2 experiment; retired from the active runtime on 2026-07-29

## Product Decision

V1 used one jelly-jade physical material whose differences were driven by five
continuous appearance values. Those values remain valid for existing V1
collectibles, but they were too subtle in mobile views and thumbnails to
communicate material value at a glance.

V2 separates a readable base material from the traits that make two collectibles
of the same material distinct.

```text
collectible appearance = model + base material + atmosphere color + craft traits + identity
```

Material determines the base value range. Craft traits move the final quality
within and occasionally across an adjacent rarity boundary.

## Material Pool

| Material | Draw weight | Base quality | Current fidelity |
| --- | ---: | ---: | --- |
| Plastic | 30% | 15 | Ready |
| Glass | 24% | 20 | Ready, colorless high transmission |
| Wood | 19% | 32 | Approximate procedural grain |
| Iron | 13% | 40 | Ready |
| Copper | 7% | 51 | Ready |
| Silver | 3% | 60 | Ready |
| Gold | 3% | 62 | Ready |
| Crystal | 1% | 82 | Ready, smooth translucent geometry |

`jade` remains a legacy-only material identifier and has no V2 draw weight.

## Craft Vector

Every V2 collectible stores five normalized values from 1 to 100:

| Trait | Weight |
| --- | ---: |
| Craftsmanship | 30% |
| Finish | 22% |
| Purity | 20% |
| Character | 14% |
| Brilliance | 14% |

The UI maps these generic slots to material-specific language. For example,
`character` is shown as grain for wood, oxidation for copper, and inclusion
character for glass and crystal.

```text
craftScore = weighted sum of the five craft traits
qualityScore = clamp(material.baseQuality + (craftScore - 50) * 0.28)
```

The existing rarity thresholds remain unchanged:

```text
Common:       1-27
Rare:        28-42
Epic:        43-56
Legendary:   57-73
Mythic:      74-100
```

## Distribution Calibration

A deterministic 100,000-draw simulation produced:

```text
Common      54.28%
Rare        27.66%
Epic        11.05%
Legendary    6.01%
Mythic       1.00%
```

Observed material distribution stayed within normal sampling distance of the
configured 30 / 24 / 19 / 13 / 7 / 3 / 3 / 1 weights.

## Retirement boundary

This document records the earlier eight-material experiment. The active V3
product now generates only the twenty-four Color Animals with `plastic` / soft
matte resin. The Jelly Jade identifier, Jade shader, legacy generator,
Material Lab route, and historical stored-item compatibility were removed from
active code on 2026-07-29. Generic prototype helpers remain only as reusable
rendering infrastructure; their presence does not make those materials
collectible.

Restoring any retired material family requires a new product decision, current
assets, an explicit type/catalog contract, mobile rendering validation, and a
new storage migration. Archived binary assets must not be served directly from
`assets/models/archive/`.
## Known Asset Limits## Known Asset Limits

Current runtime GLBs contain positions and normals, but no UVs, textures, vertex
colors, or semantic material slots.

- Production wood still needs validated UVs and a shared compressed texture set,
  or a dedicated triplanar shader with mobile profiling.
- Glass and crystal still need validated thickness, refraction, and environment
  treatment across light and dark production stages.
- Accent colors and separate eyes or accessories require material slots, vertex
  masks, or additional geometry in the model pipeline.

## Rollback

Set new draws back to generation V1, restore `createJadeMaterial` as the direct
viewer and thumbnail dependency, and remove the V2 material fields from new mock
data. Existing V1 identity remains untouched throughout. V2 local collectibles
can be reset with the existing demo reset while the product is still in Mock
state.
