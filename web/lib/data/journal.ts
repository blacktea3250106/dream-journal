"use client";

// Client-side data access for the journal pages.
// One interface, two backends: Supabase (RLS-protected) in production,
// localStorage in demo mode so the app runs with no accounts or keys.

import { IS_DEMO } from "@/lib/demo/mode";
import {
  demoCreateDream,
  demoGetDream,
  demoGetUser,
  demoListDreams,
  demoListInterpretations,
  demoLogout,
} from "@/lib/demo/storage";
import { createClient } from "@/lib/supabase/client";
import type { Dream, Interpretation } from "@/lib/types";

export type JournalUser = { id: string; email: string | null };

export type NewDreamInput = {
  content: string;
  mood: string | null;
  user_context: string | null;
  tags: string[];
  dreamed_at: string;
};

export async function getCurrentUser(): Promise<JournalUser | null> {
  if (IS_DEMO) return demoGetUser();
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export async function signOut(): Promise<void> {
  if (IS_DEMO) {
    demoLogout();
    return;
  }
  await createClient().auth.signOut();
}

export async function listDreams(): Promise<Dream[]> {
  if (IS_DEMO) return demoListDreams();
  // RLS limits rows to the signed-in user; no user_id filter needed here.
  const { data, error } = await createClient()
    .from("dreams")
    .select("*")
    .order("dreamed_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Dream[];
}

export async function getDream(id: string): Promise<Dream | null> {
  if (IS_DEMO) return demoGetDream(id);
  const { data, error } = await createClient()
    .from("dreams")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Dream | null) ?? null;
}

export async function listInterpretations(
  dreamId: string,
): Promise<Interpretation[]> {
  if (IS_DEMO) return demoListInterpretations(dreamId);
  const { data, error } = await createClient()
    .from("interpretations")
    .select("*")
    .eq("dream_id", dreamId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Interpretation[];
}

export async function createDream(input: NewDreamInput): Promise<Dream> {
  if (IS_DEMO) {
    if (!demoGetUser()) throw new Error("尚未登入");
    return demoCreateDream(input);
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("尚未登入");
  const { data, error } = await supabase
    .from("dreams")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "儲存失敗");
  return data as Dream;
}
