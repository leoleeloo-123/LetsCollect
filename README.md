# Let's Collect

Let's Collect is an early-stage mobile-first 3D collectible toy platform. The current product shell uses React, Vite, TypeScript, Three.js, and Supabase:

- Local repo: `C:\Users\licunhongyu\Desktop\LetsCollect`
- GitHub repo: `https://github.com/leoleeloo-123/LetsCollect`
- Production URL: `https://lets-collect.vercel.app/`
- Current entry: React + Vite application in `src/`
- Legacy prototype: `legacy/hero-prototype/hero-jelly-jade-toy.html`
- Production model: `public/models/toys/jelly-jade-unicorn/model-web-v001.glb`
- Supabase project: `fpfmtmykncuknwlnakiv`
- Database migrations: `supabase/migrations/`

## Local development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` when switching Supabase projects. The checked-in publishable key fallback is browser-safe and exists so Git/Vercel deployments work without a secret environment variable; never add a Supabase secret or service-role key to frontend code.

Anonymous Auth must remain enabled in Supabase under **Authentication > Sign In / Providers > Allow anonymous sign-ins**. First-time visitors create a repeatable display name and a fixed avatar; Supabase Auth supplies the internal UUID and `profiles.public_code` supplies the unique shareable identity.

Start with [`docs/START_HERE.md`](docs/START_HERE.md) before larger architecture changes. The old HTML remains a visual and 3D behavior reference only; product work belongs in `src/`.
