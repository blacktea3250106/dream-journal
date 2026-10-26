"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IS_DEMO } from "@/lib/demo/mode";
import { getCurrentUser, signOut } from "@/lib/data/journal";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (cancelled) return;
        setLoggedIn(!!user);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
    // Re-check on navigation: the header lives in the root layout and does not remount after login.
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    setLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-30">
      {IS_DEMO && (
        <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-center text-xs py-1.5">
          🚧 Demo 模式 — 資料只存在你的瀏覽器，AI 解讀為示範範例（清除瀏覽器資料會消失）
        </div>
      )}
      <nav className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          解夢日記
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {hydrated && loggedIn ? (
            <>
              <Link href="/dreams" className="hover:underline">
                我的日記
              </Link>
              <Link href="/dreams/new" className="hover:underline font-medium">
                寫新夢
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                登出
              </button>
            </>
          ) : hydrated ? (
            <Link href="/login" className="hover:underline">
              登入
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
