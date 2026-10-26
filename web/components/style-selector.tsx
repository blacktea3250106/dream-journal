"use client";

import { useState } from "react";
import { DREAM_STYLES, type DreamStyle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IS_DEMO } from "@/lib/demo/mode";
import { demoSaveInterpretation } from "@/lib/demo/storage";
import { DEMO_INTERPRETATIONS, DEMO_LATENCY_MS } from "@/lib/demo/fixtures";

type Props = {
  dreamId: string;
  existingStyles: DreamStyle[];
  onComplete?: () => void;
};

type BatchError = { style: DreamStyle; msg: string };

export function StyleSelector({ dreamId, existingStyles, onComplete }: Props) {
  const [running, setRunning] = useState<DreamStyle | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [batchErrors, setBatchErrors] = useState<BatchError[]>([]);

  // 單一風格解讀（兩種模式共用的核心邏輯，會 throw on error）
  const runOneStyle = async (style: DreamStyle): Promise<void> => {
    if (IS_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
      const fixture = DEMO_INTERPRETATIONS[style];
      demoSaveInterpretation({
        dream_id: dreamId,
        style,
        headline: fixture.headline,
        symbols: fixture.symbols,
        body: fixture.body,
        reflection_questions: fixture.reflection_questions,
        extra_fields: fixture.extra_fields,
      });
      return;
    }
    const res = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dreamId, style }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "解讀失敗");
  };

  const interpretOne = async (style: DreamStyle) => {
    setRunning(style);
    setError(null);
    try {
      await runOneStyle(style);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解讀失敗");
    } finally {
      setRunning(null);
      onComplete?.();
    }
  };

  const interpretAll = async () => {
    setBatchRunning(true);
    setBatchErrors([]);
    setError(null);
    const errors: BatchError[] = [];
    for (let i = 0; i < DREAM_STYLES.length; i++) {
      const s = DREAM_STYLES[i];
      setRunning(s.id);
      setBatchProgress({ done: i, total: DREAM_STYLES.length });
      try {
        await runOneStyle(s.id);
        // 每跑完一個就 refresh 父層，使用者可漸進看到結果
        onComplete?.();
      } catch (err) {
        errors.push({
          style: s.id,
          msg: err instanceof Error ? err.message : "解讀失敗",
        });
      }
    }
    setRunning(null);
    setBatchRunning(false);
    setBatchProgress({ done: DREAM_STYLES.length, total: DREAM_STYLES.length });
    setBatchErrors(errors);
    onComplete?.();
  };

  const anyRunning = batchRunning || running !== null;

  const batchLabel = (() => {
    if (!batchRunning) {
      return existingStyles.length === DREAM_STYLES.length
        ? "✨ 一鍵重新生成 5 種對照"
        : "✨ 一鍵生成 5 種對照";
    }
    const currentMeta = running
      ? DREAM_STYLES.find((s) => s.id === running)
      : null;
    return `解讀中… ${batchProgress.done + 1}/${batchProgress.total}${
      currentMeta ? `（${currentMeta.label}）` : ""
    }`;
  })();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Button
          onClick={interpretAll}
          disabled={anyRunning}
          size="lg"
          className="w-full"
        >
          {batchLabel}
        </Button>
        <p className="text-xs text-slate-500 text-center">
          一次看到 5 種視角的對照，是這個 app 的核心。也可以單選下方某一種風格。
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {DREAM_STYLES.map((s) => {
          const has = existingStyles.includes(s.id);
          const isRunning = running === s.id;
          return (
            <button
              key={s.id}
              onClick={() => interpretOne(s.id)}
              disabled={anyRunning}
              className={cn(
                "text-left rounded-lg border p-3 transition-colors disabled:opacity-60",
                has
                  ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                  : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600",
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xl">{s.emoji}</span>
                <span className="font-medium">{s.label}</span>
                {has && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    已解讀
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isRunning ? "解讀中…" : has ? "點擊重新生成" : s.description}
              </p>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {batchErrors.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 space-y-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            部分風格解讀失敗（其餘已成功儲存）：
          </p>
          <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
            {batchErrors.map((e) => {
              const meta = DREAM_STYLES.find((s) => s.id === e.style);
              return (
                <li key={e.style}>
                  {meta?.emoji} {meta?.label}：{e.msg}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
