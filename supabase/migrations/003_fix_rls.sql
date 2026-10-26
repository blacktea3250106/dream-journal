-- Fix: 002_rls.sql 漏掉 interpretations 的 UPDATE policy
-- 後果：API 用 .upsert({...}, { onConflict: "dream_id,style" }) 重新生成同一風格時，
--       Supabase 會嘗試 UPDATE，被 RLS 擋下而 silently 失敗。
-- Run this in Supabase Dashboard → SQL Editor

drop policy if exists "users can update own interpretations" on public.interpretations;
create policy "users can update own interpretations"
  on public.interpretations for update
  using (
    exists (
      select 1 from public.dreams d
      where d.id = interpretations.dream_id
        and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dreams d
      where d.id = interpretations.dream_id
        and d.user_id = auth.uid()
    )
  );
