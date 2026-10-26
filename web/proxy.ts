import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function proxy(request: NextRequest) {
  // Demo mode：跳過所有 server-side auth 檢查（用前端 localStorage 假登入）
  if (IS_DEMO) {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
