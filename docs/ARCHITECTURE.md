# Architecture

## Current Architecture

The current deployed app is static:

```text
Browser -> Vercel static hosting -> hero-jelly-jade-toy.html -> GLB asset
```

No backend code runs today.

## Near-Term Architecture

Stay with vanilla HTML/CSS/JavaScript while extracting modules:

```text
pages -> components -> services/data/config -> three viewer -> public assets
```

This avoids a framework migration before the product boundaries are clear.

## Frontend Boundaries

- Pages compose screens and route-level content.
- Components own reusable UI.
- Three modules own renderer, GLB loading, controls, lighting, materials, and disposal.
- Services own future API and Supabase calls.
- Store modules own client state.
- Data modules own mock toys, series, rarity, and draw pool data.
- Config modules own paths, feature flags, environment values, and routes.

## Backend Boundary

No backend is implemented yet. Future backend work should use Supabase first because the project already has a Supabase project available in context.

Future backend responsibilities:

- Auth.
- User collections.
- Draw result generation.
- Currency and transaction writes.
- Admin-only toy and draw pool management.

## Security Direction

- Do not store passwords manually.
- Do not generate real draw results on the client.
- Use row-level permissions for user collection data.
- Keep secrets out of Git.
- Keep admin access enforced server-side.

## Deployment

Vercel deploys from GitHub `main`.

Current static routing is handled by `vercel.json`.

