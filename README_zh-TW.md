<div align="center">

# 解夢日記

**一個夢，五種解讀。** 繁體中文夢境日記：每一則夢都可以用五種流派（榮格、佛洛伊德、東方傳統、靈性神秘學、認知神經科學）交給 Claude 解讀，並排對照。

技術棧：Next.js 16、React 19、TypeScript、Tailwind 4、Supabase（Postgres + Auth + RLS）、Anthropic SDK（prompt caching）、zod、vitest。

English version: [README.md](README.md)

<img src="docs/screenshots/00-hero.png" alt="一個夢的五種流派解讀" width="820">

</div>

2026 年 5 月獨立開發，第一版 MVP 約一天完成。

## Demo

Demo 模式（`NEXT_PUBLIC_DEMO_MODE=true`）錄製：登入、載入範例夢境、一鍵生成五種解讀。Demo 模式使用預先寫好的解讀，不需 API key。

<p align="center"><img src="docs/demo.gif" alt="Demo 流程" width="720"></p>

## 功能

- 寫夢日記：內容、心情、補充背景、標籤、日期
- 五種流派解讀，各自有獨立 system prompt、語氣與專屬輸出欄位
- 一鍵生成五種對照：逐一執行、完成一個顯示一個，單一流派失敗不影響其他
- 過去 30 天日記自動帶入（最多 10 則，每則截 120 字），解讀能接住重複出現的符號與情緒
- 安全紅線：禁止診斷、預言、命運論斷；認知派偵測到風險訊號時顯示 1925 安心專線與 1980 張老師專線
- Email magic link 登入（Supabase Auth）
- Demo 模式：不需任何帳號或 API key，整個流程在瀏覽器裡用範例資料跑

## 本機執行

```bash
cd web
npm install
cp .env.example .env.local   # 預設是 demo 模式
npm run dev                  # http://localhost:3000
```

測試與檢查：`npm test`（vitest）、`npm run lint`、`npm run typecheck`、`npm run build`。

完整模式（Supabase + Claude）：在 Supabase SQL Editor 依序執行 `supabase/migrations/001_init.sql`、`002_rls.sql`、`003_fix_rls.sql`，再把 `.env.local` 的 `NEXT_PUBLIC_DEMO_MODE` 改成 `false` 並填入 keys。部署步驟見 [docs/DEPLOY.md](docs/DEPLOY.md)。

## 設計重點

- **Prompt 設計**：共用規則 + 各流派的思考工具、「不要做的」清單（避免流派互相混淆）、語氣與專屬欄位；以 `samples/` 的範例夢與手寫五派對照作為校準基準。
- **Prompt caching**：只有 system prompt 放在 cache 前綴，使用者資料全部放在 user message；每次呼叫記錄 cache 讀寫 token 數。
- **結構化輸出**：zod schema 驗證模型回傳的 JSON，容忍 code fence 與前後說明文字，錯誤訊息不包含使用者夢境內容。
- **一個流派一次呼叫**：多花一些 input token，但流派不會互相混淆，每張卡片完成就能顯示，單一失敗只影響一個流派。
- **Supabase RLS**：兩張表全開 RLS，`interpretations` 以 `exists` 子查詢驗證所屬；migration 只新增不修改（`003_fix_rls.sql` 補上 upsert 需要的 UPDATE policy）。

- **Demo 模式**：頁面只透過 `lib/data/journal.ts` 存取資料，依 `NEXT_PUBLIC_DEMO_MODE` 切換 Supabase 或 localStorage，不需任何帳號即可試用完整 UI。

架構圖、截圖與詳細設計說明見英文版 [README.md](README.md)。產品規格見 [docs/PRD.md](docs/PRD.md)。

## 授權

© 2026 Hao-Fu Chang. All rights reserved.
