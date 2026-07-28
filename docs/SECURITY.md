# Security

This document separates current security facts from future business-data requirements.

## Current State

- Supabase anonymous Auth is implemented in the browser.
- `public.profiles` stores display name, public code, avatar key, and timestamps.
- `profiles` has Row Level Security enabled.
- The onboarding RPC uses the authenticated `auth.uid()` and `security invoker`.
- The frontend uses a browser-safe publishable key and supports environment overrides.
- No service-role key or application secret belongs in frontend code.
- Collection, tickets, recent draws, and friend IDs remain browser-local Demo state.
- Draw generation and ticket deduction currently run on the client and are not authoritative.
- No Supabase collection, ticket, draw, Echo, campaign, analytics tables, or Edge Functions exist in this repository.

Current limitations:

- local collection and tickets are editable by the user;
- local business state is not scoped to the current Supabase profile ID;
- cross-device ownership and reconciliation do not exist;
- authenticated users can currently select profile rows, so Echo must not expose the raw profile table as its candidate API;
- current mock friend and activity data does not represent production relationships.

## Required Boundaries

- Use only publishable keys in browser code; never commit secret or service-role keys.
- Do not store passwords manually.
- Generate real draw results and ticket changes in trusted server-side logic.
- Make ticket deduction, DrawRecord creation, and ownership insertion atomic and idempotent.
- Scope collection, preference, Echo response, and task data with RLS.
- Enforce Representative limits and reward issuance in trusted logic.
- Return only the minimum anonymous projection needed for Echo.
- Do not expose real name, email, gender, age, occupation, precise location, photo, online status, or internal resonance score.
- Analytics must not contain chat content, photos, exact location, sensitive identity data, or inferred protected attributes.
- Campaign approval and application must be server-authorized and auditable.
- Agent output cannot grant authority, bypass feasibility, alter source code, or publish without human approval.
- Admin authorization must use trusted claims or server-side roles, not user-editable metadata.

## Before Cloud Business Data

1. define user-scoped repository contracts;
2. document the minimum Echo projection;
3. add migrations, RLS policies, grants, and rollback;
4. test access as owner, other authenticated user, and unauthenticated client;
5. keep the local Demo adapter available until the cloud path is verified;
6. review logging and analytics for accidental sensitive fields;
7. version draw probabilities and disclose them consistently.
