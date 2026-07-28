# React MVP v1 archive

This directory is a source snapshot of the working React MVP immediately before
the Companion + Echo frontend redesign on 2026-07-24.

## What is included

- the complete historical `src/` tree;
- the Vite entry document and TypeScript/Vite configuration;
- the package manifest and Vercel routing configuration.

## What is intentionally shared

Large GLB files and other public assets are not duplicated here. The archived
source keeps its original root-relative paths and therefore refers to the
repository-level `public/` assets. This avoids shipping two identical copies of
the model library.

## Restore or inspect

The archive is a historical snapshot, not a second maintained application.
To restore it, copy the archived source and configuration back to the repository
root on a temporary branch while keeping the root `public/` directory in place.
The Git history remains the authoritative rollback path.

Do not edit this snapshot when changing the active application.
