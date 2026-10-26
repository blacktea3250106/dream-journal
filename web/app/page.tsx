"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { DREAM_STYLES } from "@/lib/types";
import { getCurrentUser } from "@/lib/data/journal";

export default function Home() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (cancelled) return;
        if (user) router.replace("/dreams");
        else setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 pt-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          一個夢，
          <span className="block text-slate-500">五種解讀</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400">
          融合東方傳統、西方心理學與現代神經科學的中文夢境日記與 AI 解夢服務。
          記下你的夢，看見不同視角下的自己。
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login">
            <Button size="lg">開始寫第一個夢</Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          支援的解夢風格
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DREAM_STYLES.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <CardTitle className="text-base">{s.label}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {s.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center text-sm text-slate-500">
        <p>
          你的夢境內容絕不會被用於訓練模型，僅儲存於亞洲機房，
          隨時可匯出與刪除。
        </p>
      </section>
    </div>
  );
}
