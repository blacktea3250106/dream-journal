# 開發環境設定指引

> 預估時間：**15–25 分鐘**（多數時間是等註冊驗證 email）

---

## 0. 系統前置：Node.js（已完成）

✅ Node.js 22 已透過 `brew install node@22` 安裝完成。
驗證：
```bash
node -v   # 應顯示 v22.x
npm -v    # 應顯示 10.x 或更新
```

---

## 1. 註冊 Supabase 並開新專案

### 步驟
1. 前往 https://supabase.com → **Start your project**（建議用 GitHub 登入）
2. 點 **New Project**
3. 填寫：
   - **Name**：`oneiro`（或 `dream-journal-mvp`）
   - **Database Password**：生成一個強密碼，**存到密碼管理器**
   - **Region**：選 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**
   - **Pricing Plan**：Free
4. 等專案建立完成（約 2 分鐘）

### 取得 keys
專案開好後 → 左側選單 **⚙ Project Settings → API**
複製以下三個值：
- **Project URL** → 對應 `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → 對應 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → 對應 `SUPABASE_SERVICE_ROLE_KEY`
  ⚠️ 此 key 等同 root 權限，**絕對不要 commit、不要放前端**

### 跑資料庫遷移
進入 Supabase Dashboard → **SQL Editor** → **New query**：
1. 把 `supabase/migrations/001_init.sql` 內容貼進去 → **Run**
2. 把 `supabase/migrations/002_rls.sql` 內容貼進去 → **Run**
3. 把 `supabase/migrations/003_fix_rls.sql` 內容貼進去 → **Run**

驗證：左側 **Table Editor** 應該能看到 `dreams` 與 `interpretations` 兩個表。

---

## 2. 取得 Anthropic Claude API key

### 步驟
1. 前往 https://console.anthropic.com → 註冊（建議用 Google 登入）
2. **Settings → Billing → Add Credits** → 加值 USD $10 起步
3. **Settings → Limits** → 設置 **monthly budget cap**（建議 $20）
4. **API Keys → Create Key** → 命名 `oneiro-dev` → 複製 key

### 啟用 zero data retention（隱私重點）
- Settings → Privacy → 開啟相關選項

---

## 3. 建立 .env.local

```bash
cp web/.env.example web/.env.local
```

打開 `web/.env.local`，把上面取得的 keys 填進去。

⚠️ **重要**：
- `web/.env.local` 已被 `.gitignore` 排除，不會 commit
- 不要把 keys 貼在任何聊天、文件、Slack 訊息裡

---

## 4. 跑起來

```bash
cd web
npm run dev
```

開 http://localhost:3000

### 預期看到
1. 首頁：一個夢五種解讀的 landing
2. 點「開始寫第一個夢」→ 登入頁
3. 輸入 email → 收到 magic link → 點擊回到 `/dreams`
4. 寫一個夢 → 儲存後跳轉到夢的詳細頁
5. 選一種風格 → AI 解讀（5–10 秒後出現）
6. 可繼續選其他風格做對照

---

## 確認清單

- [ ] Supabase 專案已建立、複製了 3 個 key
- [ ] Supabase 跑完兩支 migration
- [ ] Anthropic API key 已建立、複製
- [ ] Anthropic 已加值並設置 budget cap
- [ ] `web/.env.local` 已建立並填入所有 keys
- [ ] `npm run dev` 在 web/ 跑起來
- [ ] 能從首頁登入、寫夢、得到 AI 解讀

---

## 常見問題

**Q：Supabase 免費版夠用嗎？**
A：MVP 階段完全夠。Free tier 給 500MB DB、1GB 檔案儲存、50K 月活、無限 API call。

**Q：Anthropic $10 額度能用多久？**
A：Sonnet 4.6 每次解夢約 $0.0165 → $10 ≈ 600 次解夢，開發階段非常夠。

**Q：為什麼選 Tokyo / Singapore 而不是 US？**
A：(1) 距離近、延遲低 (2) 台灣使用者對「資料存在亞洲」較安心 (3) 隱私聲明可寫得更明確。

**Q：要買網域嗎？**
A：MVP 可先用 Vercel `.vercel.app` 免費網域，正式上線前再買（NameCheap / Cloudflare Registrar，`.com` 約 NT$400/年）。

**Q：要先用 Email magic link 測試？**
A：建議先用 Email magic link（Supabase 不需額外設定）。Google OAuth 需要在 Supabase + Google Console 都設定 redirect URL，比較麻煩。
