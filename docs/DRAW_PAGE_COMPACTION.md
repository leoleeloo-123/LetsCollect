# Draw page compaction

Status: historical rollout note. The current compatibility `/draw` pool uses
all twenty-four active matte models; the six-model details below describe the
implementation at the time of this compaction change.

## Reason

The mobile draw page repeated the ticket balance already shown in the global ribbon and used a large decorative 3D stage. The extra description, rings, pedestal, floor shadow, and drag prompt delayed the primary draw action.

## Change

- The page header keeps one short line of supporting copy and removes the duplicate ticket balance.
- The draw stage uses the same plain rose background and non-interactive, slowly rotating hero viewer as the home feature.
- Hero mode removes the Three.js pedestal, contact shadow, and glow ring; the CSS halo and secondary stage copy are also removed.
- The active draw pool contains Color Otter, Color Bird, Color Teddy, Color Bunny, Color Cat, and Color Panda. Model and palette are selected independently, giving each model an equal chance and each approved palette an equal chance.
- The rule panel and draw button copy describe all six models.

## Impact

The global ticket ribbon, draw cost, local persistence, reveal sheet, protected-detail materials, and recent-draw history remain unchanged. Only one preview renderer is mounted on the draw page, and the generated collectible records its selected model normally.

## Validation

- Verify the draw action is visible without excessive scrolling at a 390 x 844 viewport.
- Confirm the preview has no halo, pedestal, floor shadow, or drag hint.
- Confirm the duplicate ticket balance is absent and the global ribbon remains visible.
- Confirm generated model IDs can be `color-otter`, `color-bird`, `color-teddy`, `color-bunny`, `color-cat`, or `color-panda`.
- Confirm all six models use their mobile GLBs, validated recoloring path, and shared thumbnail renderer.
- Run TypeScript and the production build.

## Rollback

Restore the previous `DrawPage`, remove `draw-compact.css`, and return `drawModelIds` to the desired earlier model set. No stored collectible migration is required.
