# PantryChef

PantryChef is a mobile-first PWA that turns a household pantry into practical recipes, a cost dashboard, and a conversational personal chef. It uses Supabase (Postgres/Auth/RLS) so the demo remains a single deployable Next.js app with production-shaped data controls.

## Run locally

1. Create a Supabase project, then run `supabase/migrations/0001_pantrychef.sql` and `supabase/migrations/0002_create_user_profile_trigger.sql` in order in its SQL editor. The second migration creates a profile row for every Supabase Auth user, which is required for per-user pantry ownership.
2. Copy `.env.example` to `.env.local` and complete every value. Keep `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, and `CRON_SECRET` server-side only.
3. Run `npm install`, then `npm run seed` to create/reset the demo data.
4. Run `npm run dev` and open the local URL.

## Demo login

Choose **Try the demo** and use the prefilled `demo@pantrychef.app` / `PantryChefDemo!2026` credentials. The Vercel cron invokes `/api/cron/reset-demo` every six hours using `CRON_SECRET`, restoring the demo account’s pantry, receipts, recipes, and chat history. You can reset it on demand locally with `npm run seed`.

## Deploy

Import this repository into Vercel, add the values from `.env.example`, and deploy. Add the same variables to Supabase/Vercel production settings. Set your Supabase Auth site URL and redirect URL to the deployed Vercel URL. The included `vercel.json` schedules demo resets.

## Security and scalability

RLS policies ensure each authenticated user only accesses their own inventory, receipts, recipes, sessions, messages, spend data, and jobs; `supabase/tests/rls.test.sql` verifies cross-user pantry access is denied. Receipt storage is private by owner folder and uploads are MIME/size constrained; the browser re-encodes captured images before upload to remove EXIF. API state changes enforce same-origin requests. AI inputs and model JSON are zod-validated, prompts explicitly separate user data from system instructions, and API secrets never enter client components. `ai_jobs` provides the database shape for moving OCR/generation to a Vercel queue/background worker; list endpoints should add cursor pagination as inventories grow. YouTube requests use Next’s one-hour cache.

## How Codex and GPT-5.6 were used

Codex accelerated the Next.js scaffolding, Supabase data model/RLS migration, mobile UI components, PWA configuration, demo seed data, and deployment documentation. GPT-5.6 powers receipt vision parsing, pantry summaries, structured recipe options, and the streaming personal-chef conversation. Structured JSON schemas and zod validation are used before AI results are persisted or rendered. YouTube Data API v3 supplies real tutorial results in chef chat.

For the hackathon submission, capture the Codex `/feedback` session ID from the session where core functionality was built.
