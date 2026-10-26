"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { DreamForm } from "@/components/dream-form";
import { getCurrentUser } from "@/lib/data/journal";

export default function NewDreamPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (cancelled) return;
        if (!user) router.replace("/login");
        else setOk(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ok) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>寫下這個夢</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            趁記憶還清楚的時候寫下來。儲存後可選擇用任一種風格解讀。
          </p>
        </CardHeader>
        <CardBody>
          <DreamForm />
        </CardBody>
      </Card>
    </div>
  );
}
