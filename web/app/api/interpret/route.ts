import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { interpretDream } from "@/lib/anthropic";
import { buildHistoryContext, DreamStyleSchema } from "@/lib/interpretation";

const BodySchema = z.object({
  dreamId: z.string().uuid(),
  style: DreamStyleSchema,
});

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "請求參數錯誤" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { data: dream, error: dreamErr } = await supabase
    .from("dreams")
    .select("id, content, user_context, user_id")
    .eq("id", body.dreamId)
    .single();

  if (dreamErr || !dream) {
    return NextResponse.json({ error: "找不到該夢境" }, { status: 404 });
  }
  if (dream.user_id !== user.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  // 取過去 30 天日記做 history context（之後可改成 semantic search）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data: recent } = await supabase
    .from("dreams")
    .select("content, mood, dreamed_at, tags")
    .eq("user_id", user.id)
    .gte("dreamed_at", thirtyDaysAgo)
    .neq("id", dream.id)
    .order("dreamed_at", { ascending: false })
    .limit(10);

  const historyText = buildHistoryContext(recent ?? []);

  let result;
  try {
    result = await interpretDream({
      style: body.style,
      dream: dream.content,
      userContext: dream.user_context,
      history: historyText,
    });
    // Log token usage only, never dream content (personal data).
    console.info("interpret", {
      style: body.style,
      model: result.model,
      ...result.usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 解讀失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // upsert：同 (dream_id, style) 已存在則覆寫
  const { data: saved, error: saveErr } = await supabase
    .from("interpretations")
    .upsert(
      {
        dream_id: dream.id,
        style: body.style,
        headline: result.payload.headline,
        symbols: result.payload.symbols,
        body: result.payload.body,
        reflection_questions: result.payload.reflection_questions,
        extra_fields: result.payload.extra_fields,
        model: result.model,
        tokens_used: result.tokens,
      },
      { onConflict: "dream_id,style" },
    )
    .select()
    .single();

  if (saveErr) {
    return NextResponse.json(
      { error: `儲存失敗：${saveErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ interpretation: saved });
}
