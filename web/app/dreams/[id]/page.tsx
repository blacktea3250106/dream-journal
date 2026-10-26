"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StyleSelector } from "@/components/style-selector";
import { InterpretationCard } from "@/components/interpretation-card";
import {
  getCurrentUser,
  getDream,
  listInterpretations,
} from "@/lib/data/journal";
import type { Dream, Interpretation, DreamStyle } from "@/lib/types";

export default function DreamDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [dream, setDream] = useState<Dream | null>(null);
  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const d = await getDream(id);
      setDream(d);
      setInterpretations(d ? await listInterpretations(id) : []);
    } catch {
      setDream(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (cancelled) return;
        if (!user) router.replace("/login");
        else void refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [router, refresh]);

  if (loading) return null;

  if (!dream) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-slate-500">找不到這個夢</p>
        </CardBody>
      </Card>
    );
  }

  const existingStyles = interpretations.map((i) => i.style as DreamStyle);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dream.dreamed_at} 的夢
            {dream.mood && <span className="ml-2 text-xl">{dream.mood}</span>}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="whitespace-pre-wrap leading-relaxed">{dream.content}</p>
          {dream.user_context && (
            <div className="text-sm text-slate-500 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
              <span className="font-medium">背景：</span>
              {dream.user_context}
            </div>
          )}
          {dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dream.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">解讀</CardTitle>
        </CardHeader>
        <CardBody>
          <StyleSelector
            dreamId={dream.id}
            existingStyles={existingStyles}
            onComplete={refresh}
          />
        </CardBody>
      </Card>

      {interpretations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {interpretations.length === 1
              ? "解讀結果"
              : `${interpretations.length} 種風格對照`}
          </h2>
          {interpretations.map((i) => (
            <InterpretationCard key={i.id} interpretation={i} />
          ))}
        </div>
      )}
    </div>
  );
}
