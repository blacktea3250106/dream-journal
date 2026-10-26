// 判斷是否為 demo mode
// 在 demo mode 下：跳過 Supabase 與 Anthropic，全部用 localStorage 與寫死資料
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
