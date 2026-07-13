# Deployment

## Current Deployment

GitHub:

`https://github.com/leoleeloo-123/LetsCollect`

Production:

`https://lets-collect.vercel.app/`

Vercel deploys from GitHub `main`.

## Current Routing

`vercel.json` serves the Vite build and applies the SPA fallback:

```text
/(.*) -> /index.html
```

## Static Assets

The GLB file is deployed as a static asset and served by Vercel. Current cache rule:

```text
*.glb -> Cache-Control: public, max-age=31536000, immutable
```

Because GLB files are immutable cached, prefer changing filenames when replacing a model.

## Local Preview

From the project root:

```powershell
pnpm dev
```

Then open:

```text
http://127.0.0.1:5173/
```
