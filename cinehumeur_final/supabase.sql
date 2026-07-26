-- À exécuter dans Supabase > SQL Editor
create table if not exists public.cinehumeur_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cinehumeur_profiles enable row level security;

create policy "Users can read their own CineHumeur profile"
on public.cinehumeur_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own CineHumeur profile"
on public.cinehumeur_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own CineHumeur profile"
on public.cinehumeur_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.cinehumeur_profiles to authenticated;
