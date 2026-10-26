-- Row-Level Security
-- 確保使用者只能讀寫自己的資料

alter table public.dreams enable row level security;
alter table public.interpretations enable row level security;

-- ===== dreams =====
drop policy if exists "users can read own dreams" on public.dreams;
create policy "users can read own dreams"
  on public.dreams for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own dreams" on public.dreams;
create policy "users can insert own dreams"
  on public.dreams for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own dreams" on public.dreams;
create policy "users can update own dreams"
  on public.dreams for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own dreams" on public.dreams;
create policy "users can delete own dreams"
  on public.dreams for delete
  using (auth.uid() = user_id);

-- ===== interpretations =====
-- 只能讀寫屬於自己 dream 的 interpretations
drop policy if exists "users can read own interpretations" on public.interpretations;
create policy "users can read own interpretations"
  on public.interpretations for select
  using (
    exists (
      select 1 from public.dreams d
      where d.id = interpretations.dream_id
        and d.user_id = auth.uid()
    )
  );

drop policy if exists "users can insert own interpretations" on public.interpretations;
create policy "users can insert own interpretations"
  on public.interpretations for insert
  with check (
    exists (
      select 1 from public.dreams d
      where d.id = interpretations.dream_id
        and d.user_id = auth.uid()
    )
  );

drop policy if exists "users can delete own interpretations" on public.interpretations;
create policy "users can delete own interpretations"
  on public.interpretations for delete
  using (
    exists (
      select 1 from public.dreams d
      where d.id = interpretations.dream_id
        and d.user_id = auth.uid()
    )
  );
