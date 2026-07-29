# Crystal studies retirement record

Status: fully offline archive
Original retirement: 2026-07-27
Runtime retirement: 2026-07-29

## Decision

Diamond Unicorn and Diamond Dog no longer belong to the active Color Animals
product. Their source notes/assets and compact runtimes now live entirely under
`assets/models/archive/`; no Diamond file remains under `public/models/toys/`.

The active type union, catalog, generator, viewer, thumbnail path, mock Echo
data, stored-item normalization, routes, CSS, and capability registry contain
no Diamond model or tint contract. Historical browser-local Diamond items are
intentionally filtered rather than rendered by the current application.

## Archived payloads

- `assets/models/archive/diamond-unicorn/runtime/model-mobile-v001.glb` — 174,984 bytes
- `assets/models/archive/diamond-dog/runtime/model-mobile-v001.glb` — 344,052 bytes
- Per-folder `README.md` manifests record SHA-256 hashes and source provenance.

Historical identifiers such as `series_special_exhibits`, `diamond-clear`,
`diamond-ice`, `diamond-rose`, `diamond-champagne`, and `diamond-mint` are
retirement history only; they are not accepted by the active TypeScript model.

## Product boundaries

- Do not add either model to `public/`, the active catalog, a Collect series,
  seeded data, Echo fixtures, campaigns, or Agent output.
- Do not restore the removed Diamond Labs or faceted material helper merely to
  inspect an archived file.
- Do not count archived payloads toward active runtime coverage.
- A future crystal family is a new capability, not compatibility work.

## Restore path

Use a temporary branch. Copy archived runtimes to new versioned public paths,
restore or redesign the model/material implementation, register explicit IDs
and product policy, define a storage migration, and revalidate typecheck, build,
mobile WebGL, thumbnails, caches, and rollback before release.