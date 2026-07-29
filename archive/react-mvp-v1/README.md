# React MVP v1 archive

This directory is a source snapshot of the working React MVP immediately before
the Companion + Echo frontend redesign on 2026-07-24.

## What is included

- the complete historical `src/` tree;
- the Vite entry document and TypeScript/Vite configuration;
- the package manifest and Vercel routing configuration.

## Asset dependency warning

Large GLBs are not duplicated here. This snapshot still contains its original
root-relative Jelly Jade and Diamond URLs, but those runtimes moved out of the
repository-level `public/` tree on 2026-07-29. The snapshot therefore does not
run against the current root assets as-is.

To inspect it, use a temporary branch and copy the required files from
`assets/models/archive/{toy-slug}/runtime/` back to their historical
`public/models/toys/{toy-slug}/` paths. Never do that on the active branch or in
a production build.

## Restore or inspect

The archive is a historical snapshot, not a second maintained application. Git
history remains the authoritative code rollback path, while the tracked archive
manifests record local binary hashes and restore locations.

Do not edit this snapshot when changing the active application.