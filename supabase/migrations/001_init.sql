-- 解夢日記 — 初始 Schema
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- dreams: 夢境日記
-- ============================================================
create table if not exists public.dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  mood text,
  user_context text,
  sleep_hours numeric,
  tags text[] not null default '{}',
  dreamed_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dreams_user_id_idx on public.dreams (user_id);
create index if not exists dreams_dreamed_at_idx on public.dreams (dreamed_at desc);
create index if not exists dreams_tags_idx on public.dreams using gin (tags);

-- 自動更新 updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dreams_set_updated_at on public.dreams;
create trigger dreams_set_updated_at
  before update on public.dreams
  for each row execute function public.set_updated_at();

-- ============================================================
-- interpretations: 各風格解讀
-- ============================================================
create table if not exists public.interpretations (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams(id) on delete cascade,
  style text not null check (style in ('jungian','freudian','eastern','spiritual','cognitive')),
  headline text not null,
  symbols jsonb not null default '[]'::jsonb,
  body text not null,
  reflection_questions text[] not null default '{}',
  extra_fields jsonb not null default '{}'::jsonb,
  model text not null,
  tokens_used int,
  created_at timestamptz not null default now()
);

create index if not exists interpretations_dream_id_idx on public.interpretations (dream_id);
create unique index if not exists interpretations_dream_style_uniq
  on public.interpretations (dream_id, style);
