# Roadmap

## Phase 0: Audit And Project Baseline

- Document current files, entry points, deployment, and risks.
- Add handoff docs and `.env.example`.
- Keep hero page behavior unchanged.

## Phase 1: Stable Home And ThreeViewer Boundary

- Create React + Vite + TypeScript shell.
- Add React Router and mobile-first navigation.
- Add skeleton pages for Home, Explore, Draw, Collection, Profile, Login, and Register.
- Add mock toy data and basic state components.
- Extract ThreeViewer into reusable modules.
- Move model metadata into data/config.
- Keep visual output equivalent to the current hero page.
- Add basic smoke verification.

## Phase 2: Toy Data And Explore/Detail Pages

- Add mock toy, series, and rarity data.
- Build explore page with thumbnails only.
- Build toy detail page with reusable ThreeViewer.

## Phase 3: Auth Boundary

- Add auth service interface.
- Add mock auth first.
- Prepare Supabase Auth integration.

## Phase 4: Collection System

- Add collection data model.
- Add collection page and empty states.
- Use mock persistence before database integration.

## Phase 5: Mock Draw System

- Separate draw probabilities from animation.
- Add mock draw service.
- Add draw result UI and history placeholder.

## Phase 6: Backend Draw And Account Assets

- Move draw result generation to backend.
- Add atomic currency and collection writes.
- Add security and RLS policies.

## Phase 7: Admin Foundation

- Reserve admin routes and data permissions.
- Add toy, series, asset, and draw pool management later.

## Phase 8: Performance, Tests, And Production Hardening

- Add model loading tests.
- Add mobile performance checks.
- Add WebGL fallback.
- Add deployment verification.
