# Draw page compaction

## Reason

The mobile draw page repeated the ticket balance already shown in the global ribbon and used a large decorative 3D stage. The extra description, rings, pedestal, floor shadow, and drag prompt delayed the primary draw action.

## Change

- The page header keeps one short line of supporting copy and removes the duplicate ticket balance.
- The draw stage uses the same plain rose background and non-interactive, slowly rotating hero viewer as the home feature.
- Hero mode removes the Three.js pedestal, contact shadow, and glow ring; the CSS halo and secondary stage copy are also removed.
- The active draw pool now contains Color Dog, Color Bird, Color Teddy, Color Bunny, and Color Cat. Model and palette are selected independently, giving each model a 20% chance and each approved palette an equal chance.
- The rule panel and draw button copy describe all five models.

## Impact

The global ticket ribbon, draw cost, local persistence, reveal sheet, protected-detail materials, and recent-draw history remain unchanged. Only one preview renderer is mounted on the draw page, and the generated collectible records its selected model normally.

## Validation

- Verify the draw action is visible without excessive scrolling at a 390 x 844 viewport.
- Confirm the preview has no halo, pedestal, floor shadow, or drag hint.
- Confirm the duplicate ticket balance is absent and the global ribbon remains visible.
- Confirm generated model IDs can be `color-dog`, `color-bird`, `color-teddy`, `color-bunny`, or `color-cat`.
- Confirm Color Teddy, Color Bunny, and Color Cat use their mobile GLBs, validated protection shaders, and thumbnail renderer.
- Run TypeScript and the production build.

## Rollback

Restore the previous `DrawPage`, remove `draw-compact.css`, and return `drawModelIds` to the desired earlier model set. No stored collectible migration is required.
