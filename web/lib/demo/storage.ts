"use client";

import type { Dream, Interpretation, DreamStyle } from "@/lib/types";

const KEY_DREAMS = "oneiro:demo:dreams";
const KEY_INTERPS = "oneiro:demo:interpretations";
const KEY_USER = "oneiro:demo:user";

const FAKE_USER_ID = "demo-user-0001";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ===== 假登入 =====
export type DemoUser = { id: string; email: string };

export function demoGetUser(): DemoUser | null {
  return safeRead<DemoUser | null>(KEY_USER, null);
}

export function demoLogin(email: string): DemoUser {
  const user: DemoUser = { id: FAKE_USER_ID, email };
  safeWrite(KEY_USER, user);
  return user;
}

export function demoLogout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_USER);
}

// ===== Dreams =====
export function demoListDreams(): Dream[] {
  const dreams = safeRead<Dream[]>(KEY_DREAMS, []);
  return dreams.sort((a, b) => (a.dreamed_at < b.dreamed_at ? 1 : -1));
}

export function demoGetDream(id: string): Dream | null {
  return demoListDreams().find((d) => d.id === id) ?? null;
}

export function demoCreateDream(input: {
  content: string;
  mood: string | null;
  user_context: string | null;
  tags: string[];
  dreamed_at: string;
}): Dream {
  const now = new Date().toISOString();
  const dream: Dream = {
    id: crypto.randomUUID(),
    user_id: FAKE_USER_ID,
    content: input.content,
    mood: input.mood,
    user_context: input.user_context,
    sleep_hours: null,
    tags: input.tags,
    dreamed_at: input.dreamed_at,
    created_at: now,
    updated_at: now,
  };
  const dreams = safeRead<Dream[]>(KEY_DREAMS, []);
  dreams.push(dream);
  safeWrite(KEY_DREAMS, dreams);
  return dream;
}

export function demoDeleteDream(id: string) {
  const dreams = safeRead<Dream[]>(KEY_DREAMS, []).filter((d) => d.id !== id);
  safeWrite(KEY_DREAMS, dreams);
  const interps = safeRead<Interpretation[]>(KEY_INTERPS, []).filter(
    (i) => i.dream_id !== id,
  );
  safeWrite(KEY_INTERPS, interps);
}

// ===== Interpretations =====
export function demoListInterpretations(dreamId: string): Interpretation[] {
  return safeRead<Interpretation[]>(KEY_INTERPS, [])
    .filter((i) => i.dream_id === dreamId)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}

export function demoSaveInterpretation(input: {
  dream_id: string;
  style: DreamStyle;
  headline: string;
  symbols: Interpretation["symbols"];
  body: string;
  reflection_questions: string[];
  extra_fields: Record<string, unknown>;
}): Interpretation {
  const interps = safeRead<Interpretation[]>(KEY_INTERPS, []);
  // 同 (dream_id, style) 已存在則覆寫
  const existingIdx = interps.findIndex(
    (i) => i.dream_id === input.dream_id && i.style === input.style,
  );
  const interp: Interpretation = {
    id: crypto.randomUUID(),
    dream_id: input.dream_id,
    style: input.style,
    headline: input.headline,
    symbols: input.symbols,
    body: input.body,
    reflection_questions: input.reflection_questions,
    extra_fields: input.extra_fields,
    model: "demo-fixture",
    tokens_used: null,
    created_at: new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    interps[existingIdx] = interp;
  } else {
    interps.push(interp);
  }
  safeWrite(KEY_INTERPS, interps);
  return interp;
}

// ===== 一鍵填入示範資料 =====
export function demoSeedSampleDream(): Dream {
  const sample = demoCreateDream({
    content:
      "我夢到自己在一個很大的老火車站等車，月台的號碼一直在變。我手上拿著一張車票，但上面的字是模糊的。站務員是一位戴紅帽子的老先生，他一直對我說「下一班就是你的」，可是每一班車進站時，車門都沒有打開。後來我走進一條地下通道，通道盡頭是一間開滿向日葵的溫室，裡面有一台舊收音機在播放我小學時聽過的歌。我站在那裡聽完整首歌，醒來時覺得很平靜，還有點捨不得。",
    mood: "🤔",
    user_context: "下個月要和朋友去台南玩，這週一直在比較火車班次。",
    tags: ["火車站", "車票", "溫室", "收音機"],
    dreamed_at: new Date().toISOString().slice(0, 10),
  });
  return sample;
}

export function demoClearAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_DREAMS);
  window.localStorage.removeItem(KEY_INTERPS);
  window.localStorage.removeItem(KEY_USER);
}
