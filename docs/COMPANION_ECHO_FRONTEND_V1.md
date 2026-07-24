# Companion + Echo frontend v1

Status: implemented on `codex/companion-echo-frontend`

Date: 2026-07-24

This note records the reason, impact, validation plan, and rollback path for the
first frontend implementation of the Companion + Echo product baseline. It
should be read together with:

- `COMPANION_ECHO_PRODUCT_BASELINE.md`
- `ASSET_CAPABILITY_REGISTRY.md`
- `ARCHITECTURE.md`
- `DATA_MODEL.md`

## Why this change exists

The previous React MVP proved the 3D draw and collection mechanics, but its
primary information architecture still emphasized a home feed, friends, ratings,
and multiple simultaneous 3D canvases. The new product baseline makes collection
the foreground experience and keeps social value as a finite, low-pressure
second layer.

The implementation follows the intended product balance:

- roughly 80% Collect and Collection;
- roughly 15% finite anonymous Echo;
- roughly 5% internal Agent demonstration.

It does not introduce chat, follows, real-person profiles, infinite discovery,
new 3D scenes, or invented Companion assets.

## Archived baseline

The working React MVP immediately before this redesign is preserved at:

`archive/react-mvp-v1/`

The snapshot was verified file-by-file against the Git baseline before active
source changes began. It includes the complete historical `src/` tree and root
runtime configuration. Large public GLB assets are intentionally shared with the
repository-level `public/` directory instead of duplicated.

The archive was saved independently in Git commit `f71ea31`.

## Active route map

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Collector | Collect landing, one live 3D hero, real model/color/material preferences |
| `/draw` | Collector | Existing random encounter and reveal flow, with calmer product language |
| `/collection` | Collector | Representatives, filters, Favorites, 3D detail, Collection Signature |
| `/echo` | Collector | At most three finite anonymous Echo candidates and one small shared task |
| `/agent` | Internal/demo | Evolution Agent lifecycle, signals, proposals, feasibility, approval |
| `/friends` | Compatibility | Redirects to `/echo` |
| `/profile` | Compatibility | Redirects to `/collection` |

Primary navigation contains only Collect, Collection, and Echo. The Agent
Console remains a separately marked internal route.

## Reused 3D system

The redesign does not replace the proven rendering stack.

- `ToyViewer` remains the only live C-end 3D renderer.
- The Collect first viewport mounts one live hero viewer instead of six live
  tile viewers.
- Collection and Echo lists use the existing cached thumbnail renderer.
- Collection and draw detail surfaces continue to open the existing interactive
  3D viewer.
- All six matte models retain their verified per-model recolor semantics.
- Diamond Unicorn remains the only current crystal model and retains its five
  verified tints.

No GLB, material shader, mask texture, or probability constant is changed by
this frontend migration.

## Product state and adapters

### Development-only identity

Setting `VITE_DEMO_PROFILE=true` while running the Vite development server
provides a fixed local profile for UI verification. The switch is also guarded
by `import.meta.env.DEV`, so it cannot bypass Supabase Auth in a production
build. It exists to test protected routes without creating a real anonymous
Supabase user; it is not a production authentication mode.

### Collector state

`MvpStateProvider` remains the current local repository adapter and keeps the
existing `lets-collect-mvp-state-v12` storage key. The snapshot now also stores:

- Favorite collectible IDs;
- up to three Representative collectible IDs;
- explicit model, color-mood, and material preferences.

Old v12 snapshots are normalized and migrated without deleting earlier keys.
The existing draw behavior still adds a result directly to Collection; the
result UI says this explicitly instead of pretending a pending-acceptance
contract already exists.

### Collection Signature

Collection Signature is deterministic and explainable. It weights:

- actual collection contents;
- recent acquisition order;
- Favorites;
- Representative Companions;
- real palette groups;
- matte versus the single crystal exhibit.

It returns two to four lightweight tendency tags, a non-diagnostic description,
and visible evidence. It does not infer personality.

### Echo and Resonance

Echo UI depends on an `EchoService`, not directly on fixture data. The current
adapter uses isolated demo collectors and local persistence. The deterministic
Resonance service only emits reasons supported by intersections between the
current collector's real collection/preferences and candidate representatives.
Internal score and confidence stay in structured service output and are never
rendered.

Echo is intentionally finite:

- at most three candidates per local day;
- anonymous names and current real Companion combinations only;
- Leave an Echo or Let it drift;
- no free text, chat, online status, location, demographic fields, or match
  percentage;
- one bounded Collect Together task after a mutual Echo.

### Evolution Agent

The internal Console uses deterministic aggregated fixtures behind a service
boundary. Its flow is:

Observe → Reason → Propose → Human Approve → Measure

Every proposal is checked against the centralized capability registry.

- A current-asset campaign can advance through human approval.
- A Sleepy Crystal proposal is marked as a Roadmap Proposal because Sleepy
  assets and additional crystal models do not exist.
- Proposals requiring new assets cannot be approved or published.
- Approval records configuration intent; the Agent never changes source code or
  bypasses a human release step.

### Analytics

A typed local analytics adapter records only product events and opaque domain
IDs. Its contract excludes chat content, precise location, photos, and sensitive
identity data. It can be replaced by a Supabase or API adapter later without
changing page components.

## Visual direction

The active theme preserves the existing rose brand accent while moving the
surrounding system toward:

- warm off-white page backgrounds;
- low-saturation sage and fog-blue support colors;
- generous whitespace;
- lighter borders and quieter shadows;
- fewer live 3D surfaces;
- reduced card and metric emphasis;
- responsive layouts and reduced-motion behavior.

The 3D Companion remains the first visual subject. Interface decoration does not
attempt to simulate a room, garden, forest, or virtual world.

## Validation plan

Before publishing the branch:

1. run TypeScript type checking;
2. run the production Vite build;
3. confirm that no lint or test scripts are omitted when they exist;
4. inspect Collect, Draw, Collection, Echo, and Agent routes at desktop and
   mobile widths;
5. verify live GLB loading, a color preference change, Favorite,
   Representative selection, finite Echo actions, mutual task progress, current
   campaign approval, and blocked Roadmap approval;
6. check browser console errors and `prefers-reduced-motion`;
7. run `git diff --check`.

## Validation record

Validated locally on 2026-07-24:

- TypeScript `--noEmit` check passed.
- The production Vite build passed after transforming 1,722 modules.
- Vite reports the existing structural warning that the shared Three.js chunk is
  674.49 kB minified; routes are already lazy-loaded, and further Three.js
  splitting is a follow-up optimization rather than a release blocker.
- Collect, Draw, Collection, Echo, and Agent rendered at 1440 x 900 and
  390 x 844 without error overlays or horizontal overflow.
- Collect kept one live first-viewport canvas; protected routes were exercised
  through the development-only profile without writing a Supabase user.
- Preference switching, random encounter reveal, Favorite, Representative, 3D
  detail, mutual Echo, Collect Together reward, current campaign approval, and
  blocked Roadmap approval all passed browser interaction checks.
- The browser error log was empty.
- The package has no lint or automated test script; none is claimed as run.

## Rollback

The production entry is not changed directly from `main`; this work lives on an
independent branch.

Safe rollback options are:

1. revert the final frontend implementation commit; or
2. on a temporary branch, restore the files from
   `archive/react-mvp-v1/` to the repository root while retaining the shared
   `public/` assets.

The historical single-file hero under `legacy/hero-prototype/` remains untouched.

## Deliberate limits

This version does not claim:

- a production multi-user Echo backend;
- a production campaign publishing system;
- a trained or LLM-dependent personality model;
- new Companion archetypes or material families;
- real-time shared tasks;
- chat or direct messaging;
- a pending draw-result transaction.

Those boundaries are visible in code and in the capability registry rather than
being hidden behind aspirational UI.
