# 解夢日記 — Agent Instructions

> 跨工具 agent 共用規則（Claude Code / Cursor / Codex CLI / Copilot 都讀此檔）。
> 詳細產品規格見 `docs/PRD.md`，本檔只列**寫 code 時必須遵守**的事。

## Stack（不要擅自更動）

- Next.js 16（App Router、Turbopack） + TypeScript + Tailwind 4
- Supabase（Postgres + Auth + RLS）
- `@anthropic-ai/sdk`，**必用 prompt caching**；Sonnet 4.6 主力解讀、Haiku 4.5 輕量任務（標籤、摘要）
- Vercel 部署、npm（已有 lockfile，不要切 pnpm/bun）

## 開發指令

```bash
cd web && npm run dev      # http://localhost:3000
npm run build && npm run lint
```

DB migration 手動到 **Supabase Dashboard → SQL Editor** 執行 `supabase/migrations/*.sql`，順序很重要。

## 機密與 API key

- `web/.env.local` 已 gitignore — **絕不 commit、絕不貼任何聊天訊息、絕不放前端**
- Anthropic key 只能在 Server Actions / Route Handlers 用；**任何 `'use client'` 檔 import server SDK → 紅燈**
- 要新增 user 機密欄位前先問，不要自作主張

## Code 規範

- TypeScript strict 模式，禁止 `any` 漏網
- UI 元件手刻在 `web/components/`，**不要跑 shadcn CLI 安裝**
- 表單一律 `react-hook-form` + `zod`
- Supabase: server side 用 `lib/supabase/server.ts`、client side 用 `lib/supabase/client.ts`
- 所有 user-facing 文案 **繁體中文（zh-TW）**，tone 參考 `samples/dream_01_interpretations.md`

## 產品紅線（不可妥協，違反即 revert）

1. 解讀絕不診斷精神疾病、預言未來、保證好壞運（PRD §10）
2. 認知派遇紅旗（自傷主題、失眠 > 1 個月、嚴重絕望）→ 必須顯示專業協助資源
3. **MVP 階段全部免費**：不加付費牆、不加廣告 UI、不加月訂閱 flow（PRD §8）
4. Anthropic API 必走 zero-data-retention；使用者夢境**絕不**用於訓練
5. 不導入命理推銷 / 開運課程 / NFT / 加密貨幣
6. 5 種解讀風格邊界不可混淆（榮格不講吉凶、東方不講原型、認知不講靈魂、神秘不做臨床建議——詳見 `samples/`）

## 修 prompt 流程（最高槓桿）

1. 改 `web/lib/prompts/<style>.ts`
2. 用 `samples/dream_01.md` 跑五風格對照
3. 結果必須通過 PRD §12 五項自評（風格明顯不同 / 不互相重複 / 個人化接住 / 同夢對照價值強 / 不卡在資訊不足）

## DB schema 修改

- 新 migration → `supabase/migrations/00X_<name>.sql`，**不准改舊 migration 檔**
- 新 RLS policy 必過 4 個測試：自己可 select / update / delete，別人皆不可存取

## 不要做

- 不要碰 `node_modules/`、`.next/`、`tsconfig.tsbuildinfo`
- prompts 不可寫死在 component 裡，**一律走 `lib/prompts/`**
- 新增 `dependencies` 前先問，stack 已定，不要無聲加重
- 不要把 `dreams.content` 或 `interpretations.body` 直接 log 到 console / Sentry / PostHog（個資）

## 延伸閱讀

- `docs/PRD.md` — 產品規格（最重要，14 章）
- `docs/SETUP.md` — 環境與 key 設定
- `samples/dream_01_interpretations.md` — 5 風格 ground truth 對照
