# Material System V2

Status: accepted for local MVP integration

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
| Wood | 24% | 20 | Approximate procedural grain |
| Iron | 19% | 32 | Ready |
| Copper | 13% | 40 | Ready |
| Silver | 7% | 51 | Ready |
| Gold | 3% | 60 | Ready |
| Crystal | 3% | 62 | Ready |
| Diamond | 1% | 82 | Approximate smooth geometry |

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
character for crystal and diamond.

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

## Runtime Integration

- `createToyMaterial` is the shared material boundary for live 3D and cached
  thumbnails.
- Legacy `jade` delegates to `createJadeMaterial` without changing its shader or
  appearance signature.
- V2 materials use the shared prototype registry plus collectible craft traits.
- Mobile stages retain environment reflection for V2 metals and minerals.
- Thumbnail render version 3 invalidates V1 material previews without changing
  collectible identity.
- The unlisted `/material-lab` route remains available for same-light comparison.

## Compatibility

`generationVersion = 2` applies to newly generated collectibles. Existing stored
V1 collectibles are normalized at the local repository boundary:

- missing `materialId` becomes `jade`;
- the original ID, public code, seed, generation version, and appearance
  signature remain unchanged;
- V1 jade grades and five-dimensional appearance remain visible;
- V1 collectibles are never silently converted to crystal or another V2 material.

## Known Asset Limits

Current runtime GLBs contain positions and normals, but no UVs, textures, vertex
colors, or semantic material slots.

- Production wood still needs validated UVs and a shared compressed texture set,
  or a dedicated triplanar shader with mobile profiling.
- Production diamond needs faceted geometry or an approved normal treatment to
  become clearly distinct from crystal.
- Accent colors and separate eyes or accessories require material slots, vertex
  masks, or additional geometry in the model pipeline.

## Rollback

Set new draws back to generation V1, restore `createJadeMaterial` as the direct
viewer and thumbnail dependency, and remove the V2 material fields from new mock
data. Existing V1 identity remains untouched throughout. V2 local collectibles
can be reset with the existing demo reset while the product is still in Mock
state.
