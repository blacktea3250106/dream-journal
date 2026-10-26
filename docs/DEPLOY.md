# Deploying Dream Journal (Vercel + Supabase)

These steps use your own accounts. Nothing in this repo creates accounts or deploys on its own. Plan for about 30 minutes.

You will end up with:

- a Supabase project holding the database and handling login
- a Vercel project serving the Next.js app from the `web/` folder
- an Anthropic API key stored only as a Vercel environment variable

---

## 1. Push the repo to GitHub

```bash
# from the repo root, after creating an empty repo on github.com (no README, no .gitignore)
git remote add origin git@github.com:<your-username>/dream-journal.git
git branch -M main
git push -u origin main
```

Before pushing, confirm no env file is tracked:

```bash
git ls-files | grep -i env     # should print only web/.env.example
```

## 2. Create the Supabase project

1. Go to https://supabase.com → **New project**.
2. Pick a region close to your users (Tokyo or Singapore for Taiwan), set a strong database password and save it in a password manager.
3. When the project is ready, open **SQL Editor → New query** and run these files one at a time, in this order:
   1. `supabase/migrations/001_init.sql`
   2. `supabase/migrations/002_rls.sql`
   3. `supabase/migrations/003_fix_rls.sql`
4. Check **Table Editor**: you should see `dreams` and `interpretations`, each marked "RLS enabled".
5. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   The app does not need the `service_role` key. Do not put it anywhere in Vercel.

## 3. Get an Anthropic API key

1. Go to https://console.anthropic.com → **API Keys → Create key**.
2. Set a monthly spend limit under **Billing / Limits** (for example US$10 while testing).
3. Copy the key. It goes only into Vercel's environment variables.

## 4. Create the Vercel project

1. Go to https://vercel.com → **Add New → Project** → import the GitHub repo.
2. **Root Directory**: set to `web`. (The Next.js app lives there.)
3. Framework preset: Next.js (auto-detected). Leave build and install commands at their defaults.
4. **Environment Variables** (Production and Preview):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_DEMO_MODE` | `false` |
   | `NEXT_PUBLIC_SUPABASE_URL` | from step 2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 2 |
   | `ANTHROPIC_API_KEY` | from step 3 |
   | `ANTHROPIC_MODEL_MAIN` | `claude-sonnet-4-6` (optional; this is the default) |

5. Click **Deploy** and note the URL, for example `https://dream-journal-xxxx.vercel.app`.

> Want a public demo that costs nothing to run? Deploy a second Vercel project from the same repo with only `NEXT_PUBLIC_DEMO_MODE=true`. It needs no Supabase or Anthropic variables.

## 5. Point Supabase Auth at the deployed URL

In Supabase **Authentication → URL Configuration**:

- **Site URL**: your Vercel URL, e.g. `https://dream-journal-xxxx.vercel.app`
- **Redirect URLs**: add
  - `https://dream-journal-xxxx.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local development)

Without this, the magic-link email sends users back to localhost.

Optional: Supabase's built-in email sender is rate-limited. For real users, set up custom SMTP under **Authentication → Emails → SMTP Settings**.

## 6. Smoke test

1. Open the Vercel URL, go to **登入**, enter your email and click the link you receive.
2. Write a dream, open it, click **一鍵生成 5 種對照**. Five cards should appear one by one.
3. In Vercel **Logs**, each call to `/api/interpret` prints an `interpret` line with token counts. Run the same school twice within a few minutes: the second call should show `cacheReadTokens` above zero.
4. RLS check: log in from a private window with a second email. The first account's dreams must not appear, and opening a first-account dream URL must show "找不到這個夢".

## 7. After launch

- Rotate the Anthropic key if it is ever pasted anywhere outside Vercel.
- Keep the Anthropic spend limit in place.
- New database changes go in a new file, `supabase/migrations/004_<name>.sql`. Never edit migrations that have already run.
