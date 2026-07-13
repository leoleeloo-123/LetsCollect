# Deployment

## Current Deployment

GitHub:

`https://github.com/leoleeloo-123/LetsCollect`

Production:

`https://lets-collect.vercel.app/`

Vercel deploys from GitHub `main`.

## Current Routing

`vercel.json` rewrites:

```text
/ -> /hero-jelly-jade-toy.html
```

## Static Assets

The GLB file is deployed as a static asset and served by Vercel. Current cache rule:

```text
*.glb -> Cache-Control: public, max-age=31536000, immutable
```

Because GLB files are immutable cached, prefer changing filenames when replacing a model.

## Local Preview

From the project root, any static server can be used. Example:

```powershell
python -m http.server 5185
```

Then open:

```text
http://127.0.0.1:5185/hero-jelly-jade-toy.html
```

