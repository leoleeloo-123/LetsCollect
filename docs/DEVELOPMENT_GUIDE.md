# Development Guide

## Current Approach

Stay with vanilla HTML/CSS/JavaScript until there is a clear reason to add a build tool or framework.

## Change Strategy

- Keep changes small and documented.
- Preserve the working hero page until a replacement is verified.
- Extract before expanding: ThreeViewer, data, config, styles, then pages.
- Avoid adding product logic directly inside `hero-jelly-jade-toy.html`.

## Verification Checklist

For each meaningful change:

- Page loads locally.
- Console has no relevant errors.
- GLB path resolves.
- Desktop interaction works.
- Mobile layout is checked when UI changes.
- Vercel route still resolves.

