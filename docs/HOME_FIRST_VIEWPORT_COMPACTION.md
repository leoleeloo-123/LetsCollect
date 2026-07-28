# Home first-viewport compaction

Status: historical rollout note, superseded by the series-first Collect shelf
documented in `docs/COLLECT_SERIES_V2.md`.

The six-model layout below records an earlier implementation and is not a
description of the current twenty-four-model product.

## Reason

The mobile home screen should show both the featured 3D collectible and the daily collection action without requiring an immediate scroll. The previous hero reserved too much vertical space around the model, while the stacked ritual-card treatment added visual depth without improving task discovery.

## Change

- The featured hero uses a shorter stage, a closer hero camera, and slow continuous rotation.
- Hero dragging and the drag hint are disabled; the model remains visibly three-dimensional through motion.
- The supporting paragraph and decorative floor line are removed.
- The draw action sits beside the collectible name as a compact control.
- Six active models are supplied by the home series data list in a 3-by-2 live grid. Dragging the grid synchronizes their rotation through one shared controller.
- Daily ritual tasks use one standard-width card with an internal progress indicator and a short cross-slide transition.

## Impact

The existing mobile GLBs, protected-detail shaders, catalog data, draw route, and collection state are unchanged. The six lightweight tile viewers use mobile GLBs, capped pixel ratio, reduced lighting, and a shared rotation controller. Collection lists continue to use cached WebP thumbnails instead of mounting more live renderers.

## Validation

- Verify the hero and ritual card together at a 390 x 844 viewport.
- Confirm all six models load, make the short synchronized intro turn, and respond together to horizontal dragging.
- Confirm the 3-by-2 grid and count label match the six-model home series data list.
- Confirm the grid shows no per-model drag hint, floor divider, or continuous rotation to the rear.
- Confirm touch swipes, progress-dot selection, keyboard arrows, and task actions all change the active ritual task.
- Run TypeScript and the production build.

## Rollback

Restore the previous `CollectibleSeriesStage`, return `homeSeriesToys` to the single featured collectible, remove the compact home stylesheet, and return the ritual deck to its prior stacked-card implementation. The viewer's default `intro` rotation mode preserves all non-home behavior.
