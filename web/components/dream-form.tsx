"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/textarea";
import { createDream } from "@/lib/data/journal";

const MOODS = ["😀", "😐", "😟", "😨", "😢", "🤔", "😴", "🥰"];

export function DreamForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("");
  const [userContext, setUserContext] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [dreamedAt, setDreamedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("請寫下夢的內容");
      return;
    }
    setSubmitting(true);
    setError(null);

    const tags = tagsRaw
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const dream = await createDream({
        content: content.trim(),
        mood: mood || null,
        user_context: userContext.trim() || null,
        tags,
        dreamed_at: dreamedAt,
      });
      router.push(`/dreams/${dream.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">夢的日期</label>
        <Input
          type="date"
          value={dreamedAt}
          onChange={(e) => setDreamedAt(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          夢的內容 <span className="text-red-500">*</span>
        </label>
        <Textarea
          rows={8}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="盡可能寫下你記得的細節：場景、人物、情緒、聲音、顏色…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">心情</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m === mood ? "" : m)}
              className={`text-2xl w-11 h-11 rounded-full border transition-colors ${
                m === mood
                  ? "border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-800"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          補充背景（可選）
        </label>
        <Textarea
          rows={3}
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="例：最近工作壓力大、剛和朋友吵架、考慮搬家…（這些訊息能讓 AI 解讀更個人化）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">標籤（可選）</label>
        <Input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="用空格或逗號分隔，例：火車站 童年 期待"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "儲存中…" : "儲存夢境"}
        </Button>
      </div>
    </form>
  );
}
