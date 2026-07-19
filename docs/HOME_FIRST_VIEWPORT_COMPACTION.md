# Home first-viewport compaction

## Reason

The mobile home screen should show both the featured 3D collectible and the daily collection action without requiring an immediate scroll. The previous hero reserved too much vertical space around the model, while the stacked ritual-card treatment added visual depth without improving task discovery.

## Change

- The featured hero uses a shorter stage, a closer hero camera, and slow continuous rotation.
- Hero dragging and the drag hint are disabled; the model remains visibly three-dimensional through motion.
- The supporting paragraph and decorative floor line are removed.
- The draw action sits beside the collectible name as a compact control.
- Dog and Bird are supplied by the home series data list. Progress dots are generated from that list, and a horizontal swipe switches the active model without rendering inactive GLBs.
- Daily ritual tasks use one standard-width card with an internal progress indicator and a short cross-slide transition.

## Impact

The existing mobile GLBs, protected-detail shaders, catalog data, draw route, and collection state are unchanged. Only the active featured GLB is mounted, so adding more entries does not multiply the hero's live Three.js renderers. Continuous hero rotation remains capped at the viewer's idle frame rate and respects reduced-motion preferences.

## Validation

- Verify the hero and ritual card together at a 390 x 844 viewport.
- Confirm Dog and Bird load, rotate slowly, and switch through both horizontal swipes and progress-dot selection.
- Confirm the number of progress dots and the count label match the home series data list.
- Confirm the model shows no drag hint, side preview, navigation arrows, or floor divider.
- Confirm touch swipes, progress-dot selection, keyboard arrows, and task actions all change the active ritual task.
- Run TypeScript and the production build.

## Rollback

Restore the previous `CollectibleSeriesStage`, return `homeSeriesToys` to the single featured collectible, remove the compact home stylesheet, and return the ritual deck to its prior stacked-card implementation. The viewer's default `intro` rotation mode preserves all non-home behavior.
