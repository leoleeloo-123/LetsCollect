# Let's Collect

Let's Collect is a mobile-first, healing digital collectible experience built
around 3D Companions.

`Collect · Connect · Companion`

The active frontend direction keeps collecting in the foreground, adds a finite
anonymous Echo layer, and demonstrates capability-aware Agents without turning
the product into chat, dating, or a virtual world.

- Local repo: `C:\Users\licunhongyu\Desktop\LetsCollect`
- GitHub repo: `https://github.com/leoleeloo-123/LetsCollect`
- Production URL: `https://lets-collect.vercel.app/`
- Current entry: React + Vite application in `src/`
- Archived React MVP: `archive/react-mvp-v1/`
- Retired single-file Hero: removed from the working tree after the React
  replacement; recoverable from Git commit `d34f28c` if a historical rollback
  is required
- Active collectible assets: twenty-four mobile matte Color Animals, nine
  regular colorways, and thirteen six-ticket special series, registered in
  `src/features/toys/catalog.ts` and `src/features/collect/collectSeries.ts`
- Offline archive assets: all Jelly Jade, Diamond Unicorn, and Diamond Dog
  source/runtime GLBs live under `assets/models/archive/`; they are absent from
  the active catalog, browser runtime, stored-item compatibility, and Labs
- Source model assets: `assets/models/source/`
- Model pipeline playbook: `playbooks/model-asset-pipeline.md`
- Supabase project: `fpfmtmykncuknwlnakiv`
- Database migrations: `supabase/migrations/`

## Local development

```bash
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

The current package does not define lint or automated test scripts.

## Current progress

As of 2026-07-28, `codex/companion-echo-frontend` contains the current product
demo: Collect, Collection, finite Echo, and the Internal Agent Console. The
consumer flow is implemented locally, but collection ownership, tickets, draw
results, Echo, analytics, and campaign approval are not yet authoritative
server data. `main` and the Vercel production entry have not been replaced by
this branch.

The next delivery focus is backend authority and production hardening:

- user-scoped collection, Favorite, Representative, and preference storage;
- atomic server-side ticket and draw transactions;
- production Echo and campaign audit boundaries;
- alignment of the TypeScript capability registry with all twenty-four active
  assets;
- lint, automated tests, mobile WebGL budget verification, and static first-load
  fallbacks.

For UI-only local verification without creating a Supabase anonymous profile,
start Vite with the development-only demo identity:

```powershell
$env:VITE_DEMO_PROFILE = "true"
pnpm run dev
```

The bypass is guarded by `import.meta.env.DEV`; production builds always use
the normal Supabase Auth and onboarding path.

Copy `.env.example` to `.env.local` when switching Supabase projects. The
checked-in publishable key fallback is browser-safe and exists so Git/Vercel
deployments work without a secret environment variable; never add a Supabase
secret or service-role key to frontend code.

Anonymous Auth must remain enabled in Supabase under **Authentication > Sign In
/ Providers > Allow anonymous sign-ins**. First-time visitors create a
repeatable display name and a fixed avatar; Supabase Auth supplies the internal
UUID and `profiles.public_code` supplies the unique shareable identity.

Start with [`docs/START_HERE.md`](docs/START_HERE.md). The approved product
baseline lives in
[`docs/COMPANION_ECHO_PRODUCT_BASELINE.md`](docs/COMPANION_ECHO_PRODUCT_BASELINE.md),
the implemented frontend migration is recorded in
[`docs/COMPANION_ECHO_FRONTEND_V1.md`](docs/COMPANION_ECHO_FRONTEND_V1.md),
the current series-first Collect decision is recorded in
[`docs/COLLECT_SERIES_V2.md`](docs/COLLECT_SERIES_V2.md), and
[`docs/ASSET_CAPABILITY_REGISTRY.md`](docs/ASSET_CAPABILITY_REGISTRY.md)
separates available capabilities from planned or unavailable ideas.

The archived React MVP and old HTML are rollback and behavior references only;
active product work belongs in `src/`.

For new toy GLB assets, keep source files in
`assets/models/source/{toy-slug}/` and export compressed frontend files into
`public/models/toys/{toy-slug}/`. Follow
[`playbooks/model-asset-pipeline.md`](playbooks/model-asset-pipeline.md) before
wiring a model into the draw flow.
