# Macarie Ieromonahul

Site-ul grupului psaltic Macarie Ieromonahul: pagini publice (HTML static) + funcții serverless Node.js (`api/`) + un dashboard de administrare (`admin/`). Fără build step — fișierele se deployează direct pe Vercel.

## Structură

- `index.html`, `magazin.html`, `agenda.html`, `sinaxar.html`, `contact.html`, `despre.html`, `parteneri.html`, `sprijina.html`, `redirect-20.html`, `redirect-35.html` — paginile publice.
- `admin/` — dashboard-ul de administrare (SPA, un singur `index.html` cu HTML+CSS+JS simplu).
- `api/` — funcții serverless (formulare, donații, CRUD pentru conținutul editabil din dashboard).
- `assets/` — JS/imagini partajate între pagini.
- `lib/` — cod comun folosit de funcțiile din `api/` (conexiune DB, autentificare).

## Bază de date

Supabase (Postgres). Schema e creată/actualizată automat de `lib/db.js` la prima cerere.

## Deploy

```bash
vercel deploy --yes           # preview
```

Promovarea în producție se face din Vercel (Deployments → Promote to Production), ca să ruleze cu variabilele de mediu de producție (`DATABASE_URL` etc.).
