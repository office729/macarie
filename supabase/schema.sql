-- Rulează acest script în Supabase Dashboard → SQL Editor, pe proiectul nou creat.

create table if not exists public.cuvinte (
  id uuid primary key default gen_random_uuid(),
  titlu text not null,
  continut text not null,
  creat_la timestamptz not null default now()
);

alter table public.cuvinte enable row level security;

create policy "Cuvintele sunt publice la citire"
  on public.cuvinte
  for select
  to anon, authenticated
  using (true);
