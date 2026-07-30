# Architecture

Status date: 2026-07-28

This document separates the architecture that exists in the repository today from the approved Companion / Echo target. A target section is a contract for future work, not a claim that the feature is already implemented.

## Current Runtime Architecture

The production application is a Vite single-page app deployed by Vercel:

```text
Browser
  -> Vercel SPA rewrite
  -> React 18 + React Router
  -> AuthProvider
  -> MvpStateProvider
  -> route-level pages
  -> series showcase renderer / reusable ToyViewer / cached thumbnails
  -> optimized GLB assets + local Draco decoder
```

The application entry is `src/main.tsx`. `src/app/App.tsx` lazy-loads route components and protects the product shell with `RequireProfile`.

The current product routes are:

- `/`: Collect series shelf with one twenty-four-model matte nine-color pool,
  thirteen configured special-series cards, three-ticket color draws,
  six-ticket special draws, and in-place reveal;
- `/draw`: client-side demo draw and reveal;
- `/collection`: local collection, Favorites, Representatives, Collection Signature, and 3D detail;
- `/echo`: finite explainable Echo and one lightweight Collect Together task;
- `/friends`: redirects to `/echo`;
- `/onboarding`: anonymous Supabase profile creation;
- material and model lab routes: development and asset inspection surfaces.

`/login` and `/register` currently redirect to `/onboarding`. `/explore` redirects to `/`, and `/profile` redirects to `/collection`.

## Current State And Persistence

The current system is deliberately hybrid:

| Concern | Current source of truth | Persistence |
| --- | --- | --- |
| Anonymous identity and session | Supabase Auth | Supabase client session storage |
| Display name, public code, avatar key | Supabase `public.profiles` | Supabase Postgres |
| Collection, tickets, recent draws | `MvpStateProvider` | browser `localStorage` |
| Friend and pending-friend IDs | `MvpStateProvider` | browser `localStorage` |
| Feed reactions and draft comments | individual React components | in-memory only |
| Rendered toy thumbnails | `ThumbnailRenderer` | browser IndexedDB |
| Toy definitions, palettes, series | TypeScript modules | application bundle |

`MvpStateProvider` is a local demo adapter, not a secure or authoritative backend. Its collection and ticket state is not scoped to the current Supabase user ID. Refresh persistence is supported, but cross-device continuity, ownership enforcement, and server reconciliation are not.

## Current Frontend Boundaries

- `src/app/` owns providers, route composition, and route constants.
- `src/pages/` composes route-level screens.
- `src/components/` owns reusable presentation and layout components.
- `src/features/` owns product logic such as draw generation, collection presentation, active series, auth, feed, and ticket display.
- `src/data/mock/` owns demo fixtures. Page components should not gain new direct dependencies on mock modules as the repository/service boundary is introduced.
- `src/services/supabase/` owns the browser Supabase client.
- `src/three/` owns Three.js rendering, model loading, materials, interaction, animation, caching, and disposal.
- `src/styles/` owns design tokens, shared layout, component styles, and the active visual theme.
- `public/models/` and `public/draco/` contain deployable runtime assets.
- `assets/models/` contains source and archived assets that are not product availability declarations.

## Current 3D Boundary

`src/data/asset-registry/` is now the source of truth for toy models,
recolor profiles, palettes, surfaces, backgrounds, series metadata, and series
membership. Compatibility modules `catalog.ts`, `surfaceStyles.ts`,
`stageThemes.ts`, and `collectSeries.ts` keep their existing public APIs.
Model-specific material factories and shader execution stay in TypeScript;
`catalog.ts` adapts declarative Registry records into the established
`ToyModelDefinition` contract. `src/features/toys/activeSeries.ts` still
defines the current generation rules.

`src/three/ToyViewer/` is the reusable live viewer. It owns:

- lazy Three.js, GLTFLoader, and DRACOLoader imports;
- local Draco decoder use;
- one download/decode promise per model URL and cloned scenes per viewer;
- responsive model selection, framing, lighting, material application, loading progress, error fallback, reduced-motion behavior, interaction, and cleanup.

`src/three/ThumbnailRenderer/` renders the real mobile GLB to a WebP poster, serializes rendering work, and stores results in IndexedDB. Collection and feed lists use thumbnails instead of keeping a WebGL canvas alive per card.

The Collect series shelf is a controlled exception to the list-thumbnail rule. Each series card owns one WebGL canvas and renderer; its models live under independent local pivots in the same scene and share one rotation value. The 24-model Color card initializes first and loads at most six models concurrently; thirteen special-series cards initialize only near the viewport. This defers model loading and render work until cards are approached, but initialized contexts remain alive until page unmount. The Crystal card is absent; its two archived assets remain available only to historical local collection rendering and internal Labs.

The series renderer reuses the mobile GLBs, the `loadToyModel` download and Draco-decode promise cache, tile-level lightweight materials, a low initial device-pixel ratio, and idle render suspension. Palette changes update material bindings on the existing scene; they must not reload a GLB or recreate the renderer. A special-series card keeps its model row above its information and actions at every breakpoint. The current shelf has fourteen series cards. Special cards initialize only after approaching the viewport, but an initialized renderer remains alive until the page unmounts; after a full-page visit, up to fourteen series WebGL contexts may coexist. This is substantially below the sixty per-tile contexts the current card contents would create, but it still requires real-device budget validation and may need future renderer recycling.

Collection, feed, friend, and history surfaces remain thumbnail lists. They must not adopt the Collect showcase exception. In-place reveal and collection detail continue to use the reusable single-model `ToyViewer`.

## Current Supabase Boundary

Supabase is already implemented for anonymous identity and profiles:

- the browser client uses a publishable key and supports environment overrides;
- sessions persist and refresh in the browser;
- first-time visitors use anonymous Auth;
- `public.profiles` stores `id`, `display_name`, `public_code`, `avatar_key`, and timestamps;
- the `complete_onboarding` Postgres function creates the profile.

No Supabase-backed collection, ticket ledger, draw pool, draw result, friend, Echo, campaign, or analytics store is implemented. There are no Edge Functions in this repository. A real draw must eventually move behind trusted server-side logic and atomically write the ticket transaction, result, and collection item.

## Approved Target Product Architecture

The approved C-end information architecture is:

```text
Collect -> Collection -> Echo
```

`Collect` remains the dominant experience. `Echo` is a small, quiet layer derived from collection behavior; it is not a friend list, feed, chat, dating, presence, follower, or match-rate system. An Evolution Agent console may live on a separate clearly marked internal/demo route such as `/agent`.

Existing 3D, draw, reveal, collection, responsive shell, and theme foundations should be evolved in place. The React + Vite application has replaced the retired single-file Hero; the old implementation is no longer kept in the working tree and is available only through Git history for a documented rollback.

## Target Adapter And Service Boundaries

The target architecture keeps React pages dependent on typed domain contracts, not on fixture files or a specific persistence provider:

```text
React pages and feature components
  -> application services
  -> repository / adapter interfaces
      -> local demo adapters
      -> future Supabase or API adapters
```

### Capability And Asset Registry

A centralized registry must distinguish `available`, `experimental`, `planned`, `legacy`, and `unavailable`. Runtime files existing in `public/` or `assets/` do not by themselves make a capability available. The twenty-four active matte Companions and two archived crystal studies must be declared explicitly, with their real model IDs, palettes, material behavior, and rendering constraints.

The local Asset Registry owns seven validated JSON tables. Pages do not import
those files directly; a normalized snapshot validates cross-table references
and compatibility modules expose typed getters. The formal roster is derived
from enabled model records, while disabled models remain addressable by stable
ID for existing collections. `activeSeries.ts`,
`ASSET_CAPABILITY_REGISTRY.md`, and
`src/config/capabilityRegistry.ts` continue to share the same formal roster.

### Collection Service And Repository

Collection operations should expose typed methods for listing owned instances, collecting a draw result, favoriting, selecting at most three Representative Companions, and deriving a Collection Signature. The signature is derived from real collection and preference signals; it is not an independently editable percentage.

The initial implementation may remain local, but the UI should consume the same interface that a future user-scoped Supabase repository can implement.

### Resonance Service

The planned Resonance Agent is a structured recommendation service, not a chat bot. It may use deterministic rule-based scoring for the demo and must retain a deterministic fallback if an external model is added later.

Its result must be traceable to real signals such as shared model choices, color preferences, material affinity, Representative Companions, or recent collection trajectories. It must not fabricate assets, demographic facts, or free-text conversation.

### Evolution Service

The planned Evolution Agent operates on aggregate anonymous signals and produces typed campaign proposals. It may adjust configuration and policy weights only through an explicit proposal and human-approval flow:

```text
Observe -> Reason -> Propose -> Human Approve -> Apply -> Measure -> Adjust
```

It cannot edit source code, create missing GLB assets, enable unimplemented features, or publish without approval. Every proposal must pass a capability feasibility check before an Approve / Publish action is enabled.

### Analytics Adapter

A minimal typed event interface should capture non-sensitive product signals needed by Collection Signature, Resonance, and campaign evaluation. The first adapter may be local/mock. A future Supabase or API adapter must be replaceable without changing page components.

Events must not contain real photos, chat content, precise location, sensitive identity data, or inferred protected attributes.

## Target Data Flow

The intended demo flow is:

```text
explicit preference
  -> encounter or draw a real available Companion
  -> collect or let the result pass
  -> favorite / choose Representatives
  -> derive Collection Signature
  -> Resonance service explains an anonymous Echo
  -> optional lightweight shared collection task
  -> return to Collect
```

The internal campaign flow is:

```text
typed aggregate events
  -> trend summary
  -> Evolution proposal
  -> capability feasibility check
  -> human approval
  -> configuration application
  -> measured outcome
```

Neither flow is implemented merely by being documented here.

## Deployment And Change Boundaries

- Vercel builds `dist/` from the Vite app and rewrites application routes to `index.html`.
- Versioned GLB and Draco assets use long-lived immutable cache headers.
- Do not put model paths, draw weights, capability availability, or API calls directly in route components.
- Use thumbnails for repeated collection, feed, friend, and history rows. A Collect
  series showcase may load live GLBs only through the documented one-canvas-per-series
  renderer; never create one canvas per member.
- Do not expose Supabase secret or service-role keys in browser code.
- Do not move real draw or ticket writes into client-only code.
- Changes to primary navigation, the core loop, active asset availability, or 3D loading policy require the product and architecture documents to be updated before implementation.
