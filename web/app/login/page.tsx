"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/textarea";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { IS_DEMO } from "@/lib/demo/mode";
import { demoLogin } from "@/lib/demo/storage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (IS_DEMO) {
      // 假登入：直接寫進 localStorage 並跳轉
      const finalEmail = email.trim() || "demo@example.com";
      demoLogin(finalEmail);
      router.push("/dreams");
      return;
    }

    // 真實 Supabase 登入（demo mode 關掉時才會走到這）
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  const handleDemoQuickIn = () => {
    demoLogin("demo@example.com");
    router.push("/dreams");
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <Card>
        <CardHeader>
          <CardTitle>登入 / 註冊</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {IS_DEMO
              ? "Demo 模式：輸入任何 email 即可進入（不會真的寄信）。"
              : "無需密碼，輸入 email 即可收到登入連結。"}
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          {sent ? (
            <div className="text-sm">
              ✉️ 已寄出登入連結到 <span className="font-mono">{email}</span>
              ，請打開信件點擊連結即可登入。
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <Input
                  type="email"
                  required={!IS_DEMO}
                  placeholder={IS_DEMO ? "your@email.com（隨便填）" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "處理中…" : IS_DEMO ? "進入 Demo" : "用 Email 登入"}
                </Button>
              </form>

              {IS_DEMO && (
                <>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span>或</span>
                    <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <Button
                    onClick={handleDemoQuickIn}
                    variant="secondary"
                    className="w-full"
                  >
                    🚀 直接進入（不填 email）
                  </Button>
                </>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
