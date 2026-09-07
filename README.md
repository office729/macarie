# Ieromonahul Macarie

Site Next.js (App Router) + Supabase, pregătit pentru deploy pe Vercel.

## 1. Rulare locală

```bash
npm install
npm run dev
```

## 2. Configurare Supabase

1. Creează un proiect nou pe [supabase.com/dashboard](https://supabase.com/dashboard).
2. În Supabase Dashboard → SQL Editor, rulează conținutul din [`supabase/schema.sql`](supabase/schema.sql) ca să creezi tabelul `cuvinte`.
3. Din Project Settings → API, copiază `Project URL` și `anon public key`.
4. Copiază `.env.example` în `.env.local` și completează:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 3. Deploy pe Vercel

1. Urcă acest folder ca repo pe GitHub (vezi mai jos).
2. Pe [vercel.com/new](https://vercel.com/new), importă repo-ul — Vercel detectează automat Next.js.
3. La pasul "Environment Variables", adaugă aceleași două variabile ca mai sus (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy.

### Urcare pe GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_REPO_GITHUB>
git push -u origin main
```

## Conținut de completat

- [`src/app/page.tsx`](src/app/page.tsx) — biografie și cuvânt introductiv (marcate cu `TODO`).
- Adaugă rânduri în tabelul `cuvinte` din Supabase (Table Editor) pentru a popula secțiunea „Cuvinte de folos”.
