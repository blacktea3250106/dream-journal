"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { IS_DEMO } from "@/lib/demo/mode";
import { demoSeedSampleDream } from "@/lib/demo/storage";
import { getCurrentUser, listDreams } from "@/lib/data/journal";
import type { Dream } from "@/lib/types";

export default function DreamsPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        const list = await listDreams();
        if (cancelled) return;
        setDreams(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "載入失敗");
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSeed = async () => {
    demoSeedSampleDream();
    setDreams(await listDreams());
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">我的日記</h1>
        <Link href="/dreams/new">
          <Button>寫新夢</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {dreams.length === 0 && (
        <Card>
          <CardBody className="text-center py-12 space-y-4">
            <p className="text-slate-500">還沒有任何夢境記錄</p>
            <div className="flex gap-2 justify-center">
              <Link href="/dreams/new">
                <Button>寫下第一個夢</Button>
              </Link>
              {IS_DEMO && (
                <Button variant="secondary" onClick={handleSeed}>
                  載入範例夢境
                </Button>
              )}
            </div>
            {IS_DEMO && (
              <p className="text-xs text-slate-400 pt-2">
                「載入範例」會放入一個示範夢境（老火車站與向日葵溫室），讓你直接體驗 5 種風格解讀
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        {dreams.map((dream) => (
          <Link key={dream.id} href={`/dreams/${dream.id}`}>
            <Card className="hover:border-slate-400 transition-colors">
              <CardBody>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs text-slate-500">
                    {dream.dreamed_at}
                  </span>
                  {dream.mood && (
                    <span className="text-lg" title="心情">
                      {dream.mood}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed line-clamp-3">
                  {dream.content}
                </p>
                {dream.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
