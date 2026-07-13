# Security

Security is mostly future-facing today because the current site is static.

## Current State

- No user authentication.
- No database writes.
- No server functions.
- No secrets are required for the current hero prototype.

## Future Requirements

- Use Supabase Auth or another mature auth provider.
- Do not store passwords manually.
- Use row-level security for user data.
- Generate real draw results server-side.
- Make currency deduction and draw result writes atomic.
- Keep admin operations server-authorized.
- Do not commit `.env` or service role keys.

