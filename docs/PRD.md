# 解夢日記 — 產品規格書（PRD v0.1）

> 版本：0.1（MVP 規劃）
> 日期：2026-05-01
> 狀態：規劃中

---

## 1. 產品一句話

**「一個夢，五種解讀」——同時融合東方傳統、西方心理學與現代神經科學的中文夢境日記與 AI 解夢服務。**

**MVP 先做 Web 版**（Next.js + Supabase + Claude API），native app 待 PMF 確立後再 port。

---

## 2. 為什麼做這個

### 市場機會（已驗證）
- 華文圈的解夢 app 大多停留在 2010 年代「周公字典查詢」型，UX 老舊、無 AI、無日記
- 唯一加 AI 的東方派競品 **BabyMall**：Android-only、無 web
- 西方 AI 解夢 app（Moru / Dreamly / Dream Journal Ultimate）**完全不懂中文文化**
- **「東方傳統 + 西方心理學 + AI 個人化 + 中文 + 跨平台」** 這個位置目前是無人區

### 差異化護城河（已驗證）
| 護城河 | 對手 |
|---|---|
| **同夢多風格對照**（一夢五解並列） | 沒人做 |
| **iOS + Android + Web 三平台** | Moru iOS-only、BabyMall Android-only |
| **真在地化**（周公 + 紫微 + 民間象徵 + 五行） | 西方派完全沒有 |
| **長期記憶 + 個人化 AI**（用過往日記做 context） | 字典 app 不可能、AI app 多半沒做好 |

---

## 3. 目標用戶

### 主要族群（Primary）
- **25–45 歲的華人女性**（解夢 / 心理 / 命理類產品的高購買意願族群）
- 對心理學、塔羅、命理至少其中一項有興趣
- 平常會在 IG / Threads / 小紅書分享心情或解夢內容
- 願意為「自我探索」類 app 付月費 NT$99–199

### 次要族群（Secondary）
- **lucid dream 玩家**（清醒夢愛好者）
- **失眠或焦慮族群**（把寫夢當情緒整理工具）
- **心理諮商個案**（在治療之間記錄夢境帶去諮商）

### 反向使用者（不為他們設計）
- 只想要「夢見蛇 = 小人」式快速答案的人 → 去用免費周公字典 app
- 嚴重精神疾病使用者 → 應導向專業協助，本 app 不是治療工具

---

## 4. MVP 功能清單

### 4.1 必做（v1.0 ship 前必備）

#### A. 帳號與資料
- [ ] Email + Apple/Google 第三方登入（Supabase Auth）
- [ ] 雲端同步（跨裝置看到同一份日記）
- [ ] 資料匯出（PDF / Markdown）
- [ ] 帳號刪除（GDPR / 個資法合規）

#### B. 寫夢日記
- [ ] 純文字輸入夢境內容
- [ ] 可填補充欄：日期、心情（選 emoji）、當天事件、睡眠時數
- [ ] 標籤系統（#火車站 #童年 等，支援自訂）
- [ ] 草稿自動儲存

#### C. AI 解夢（核心）
- [ ] **5 種風格**可選：榮格 / 佛洛伊德 / 東方傳統 / 神秘學 / 認知神經
- [ ] **同夢對照**：可一鍵生成 2~5 種風格並排（核心差異化功能）
- [ ] 解讀結果包含：核心訊息、符號分析、個人連結、反思問題
- [ ] **長期記憶**：解讀時自動參考過去 30 天日記摘要
- [ ] 重新生成 / 切換風格再解一次

#### D. 歷史與洞察
- [ ] 日記列表（時間軸 / 月曆視圖）
- [ ] 全文搜尋
- [ ] 符號重複出現統計（「你最近 90 天夢到 7 次水」）
- [ ] 情緒趨勢圖

#### E. 隱私與安全
- [ ] 應用內密碼鎖（PIN / Face ID / Touch ID）
- [ ] 明確隱私聲明：**不訓練模型、不分享給第三方**
- [ ] Claude API 走 zero data retention 模式
- [ ] DB 層級加密（Supabase 內建）

### 4.2 v1.1（首次 ship 後 1 個月內）
- [ ] 語音輸入 + 自動轉寫（Whisper）
- [ ] 推播提醒「醒來 5 分鐘內寫夢」
- [ ] 主題深色模式 / 字體大小調整
- [ ] 多語系（繁中 → 簡中 → 英文）

### 4.3 v1.2+（次要功能）
- [ ] AI 夢境插畫生成（DALL·E / Stable Diffusion）
- [ ] 匿名夢境牆（社群功能，可關閉）
- [ ] lucid dream 工具（reality check 提醒、dream sign 追蹤）
- [ ] Apple Health / Google Fit 整合（睡眠資料）
- [ ] Apple Watch / Wear OS 寫夢

### 4.4 不做的（明確排除）
- ❌ 命理開運課程推銷
- ❌ 通靈 / 算命直播
- ❌ MVP 階段的付費牆 / 廣告（先讓使用者自由用，產品先做好）
- ❌ NFT / 區塊鏈 / 任何 crypto

---

## 5. 核心使用者旅程

### Flow 1：新用戶第一次寫夢
```
開啟 app
  → 簡短引導（3 頁：什麼是這個 app / 風格簡介 / 隱私承諾）
  → 註冊 / 登入
  → 快速寫第一個夢（純文字、最低門檻）
  → 系統提示「要不要來個解讀？選一種風格試試」
  → AI 解讀生成（5–10 秒）
  → 看到結果，提示「想看別種風格嗎？來試試同夢對照」
  → 可自由切換 / 並列其他風格解讀（MVP 階段全部免費）
```

### Flow 2：早晨醒來寫夢（核心日常 flow）
```
推播「早安，趁夢還記得寫下來」（可關）
  → 點開 app 直接進入「快速寫夢」
  → 寫完按「儲存 + 解夢」
  → 選風格（記住上次選的）
  → 看解讀
  → 系統問「想再用 ___派 解一次嗎？」（推薦另一個對比風格）
  → 完成 → 回到首頁
```

### Flow 3：回顧與洞察
```
首頁 → 「你的夢境地圖」
  → 看到符號雲（最常出現的符號）
  → 點某個符號 → 看到所有相關夢的清單
  → 看到該符號跨越時間的演變（例如「水」從 1 月到 5 月的變化）
  → AI 自動產生月度回顧（MVP 階段免費，未來可能拆成「一次性深度報告」）
```

---

## 6. 技術選型（**Web-First 策略**）

### 平台策略
**MVP 先做 web，native app 等 PMF 確立後再 port。** 理由：
- 個人開發節奏，**Next.js 比 Expo 快上手、迭代快**
- Web 可做 SEO（搶「夢見蛇 解夢」這類關鍵字流量），native app 不行
- 中文使用者對「打開瀏覽器寫日記」接受度高
- 後續 port 路徑清晰：（1）PWA 補手機體驗 →（2）Expo 包裝核心 component → 上架 App Store / Google Play

### v1.0（Web）
| 層 | 選型 | 理由 |
|---|---|---|
| **框架** | **Next.js 15（App Router）** | SEO 強、SSR 支援、生態最成熟、Vercel 一鍵部署 |
| **語言** | TypeScript | 型別安全、與 AI 工具整合好 |
| **UI 框架** | **Tailwind CSS + shadcn/ui** | 開發速度、設計一致性、可直接搬到未來的 Expo |
| **狀態管理** | Zustand + TanStack Query | 輕量、處理 server state 強 |
| **後端 / DB** | Supabase（Postgres + Auth + Storage + Edge Functions） | 一站式、PostgreSQL 強、免運維 |
| **AI** | Anthropic Claude（Sonnet 4.6 主力，Haiku 4.5 輕量任務） | 中文表現好、prompt caching 省成本 |
| **AI 呼叫位置** | Next.js API Routes / Server Actions | 把 API key 留在 server，避免外洩 |
| **部署** | Vercel | Next.js 原生最佳化、免費額度足夠 MVP |
| **分析** | PostHog（cloud） | 隱私友善、開源、有 web SDK |
| **錯誤追蹤** | Sentry | 業界標準 |

### v1.1（PWA 強化手機體驗）
- 加 PWA manifest + service worker
- 加首頁「加到主畫面」引導
- 推播：用 Web Push API（iOS Safari 16.4+ 支援）

### v1.2（包成 native app，再上架）
| 層 | 選型 | 理由 |
|---|---|---|
| **包裝方式** | Expo + React Native（共用 Tailwind/shadcn 組件） | 從 Web 平移成本低 |
| 或備案 | Capacitor 直接把 Next.js 包成 app | 最快路徑、缺點是動畫表現一般 |
| **語音轉寫** | OpenAI Whisper API 或 Apple/Google 內建 | 中文準確度 |
| **圖像生成** | OpenAI DALL·E 3 或 Stability AI | 待評估成本 |
| **支付**（觸發變現後） | Stripe（Web）+ App Store / Play Store IAP | 跨平台分階段接 |

---

## 7. 資料模型（Supabase / Postgres）

```sql
-- 使用者
users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz
  -- 註：不預設 subscription tier 欄位；MVP 階段全部使用者皆免費
  -- 未來引入付費時再加 tier / credits 欄位
)

-- 夢境日記
dreams (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  content text,                    -- 夢境內文
  mood text,                       -- 心情 emoji
  user_context text,               -- 補充：當天事件
  sleep_hours numeric,
  tags text[],
  dreamed_at date,                 -- 做夢日期（不是寫的日期）
  created_at timestamptz,
  updated_at timestamptz
)

-- AI 解讀
interpretations (
  id uuid PRIMARY KEY,
  dream_id uuid REFERENCES dreams,
  style text,                      -- 'jungian' | 'freudian' | 'eastern' | 'spiritual' | 'cognitive'
  headline text,
  symbols jsonb,                   -- [{symbol, meaning, personal_link}, ...]
  body text,                       -- 主要解讀內容
  reflection_questions text[],
  extra_fields jsonb,              -- 各派專屬欄位（archetypes / dreamwork / zhougong_matches...）
  model text,                      -- 'claude-sonnet-4-6' 等
  tokens_used int,
  created_at timestamptz
)

-- 符號統計（materialized view 或定期 ETL）
symbol_stats (
  user_id uuid,
  symbol text,                     -- 標準化後的符號
  count int,
  first_seen date,
  last_seen date,
  related_dream_ids uuid[]
)

-- 註：subscriptions 表 MVP 不建，未來若引入付費再加
```

---

## 8. 盈利策略：先做產品、後想台式變現

### MVP 階段（v1.0 – v1.x）：**完全免費，不上付費牆**
- 第一年目標**不是賺錢**，是養使用者基礎、累積口碑、收回饋
- 重要前提：**台灣 C 端使用者對「解夢 / 自我探索 / 工具型」的訂閱付費接受度低**，硬上美式月訂閱會直接卡死成長
- 衡量指標換成：留存率（D7 / D30）、自發推薦、App Store 評分、寫夢頻率，**不是付費轉換率**

### 成本控制（讓免費營運能撐住）
- **Claude API**：用 prompt caching（節省 ~70% input cost）、Haiku 4.5 處理輕量任務
- **單用戶月成本估算**：重度使用者約 NT$10–20、輕度使用者 < NT$5
- **個人營運期**：每月吸收 NT$10,000 級別 API 帳單可接受（≈ 500–1000 重度活躍用戶）
- **超過這個量**：再啟動下方任一變現路徑

### 未來可能的台式變現路徑（按台灣 C 端接受度排序）

#### 🥇 路徑 1：一次性深度報告（最符合台灣消費心智）
- 月度 / 季度 / 年度的深度回顧報告，**單份 NT$99–299** 一次性購買
- 類比：紫微一次 NT$1500、塔羅一次 NT$800 的線下消費心智
- 內容：跨多月夢境的符號演變、情緒週期、長期主題分析、AI 寫成完整 PDF
- 優點：沒有訂閱負擔、買了就有、台灣人最習慣

#### 🥈 路徑 2：點數 / 加值包（LINE Points 心智）
- 例如：免費每月解夢 30 次，超過買「解夢點數包」NT$99 / 100 點
- 點數可解鎖：進階符號字典、多風格同夢對照、AI 夢境繪圖
- 心智類比：LINE 貼圖、蝦皮幣、遊戲課金

#### 🥉 路徑 3：周邊商品 / IP 變現
- 實體**手寫夢境日記本**（封面有 app logo，掃 QR 連到 app）
- **夢境塔羅卡牌組**（用 app 5 風格設計卡面）
- 與療癒系品牌（茶包、香氛、冥想音樂）聯名
- 台灣文創 / 誠品通路心智：實體商品買得下手，數位訂閱反而抗拒

#### 🏅 路徑 4：乾淨廣告（最後手段）
- 只在「歷史列表」這種非核心 flow 顯示
- **絕不打斷寫夢、解夢的核心體驗**
- 慎選廣告主（拒絕命理推銷 / 開運課程 / 投機商品）

#### 🎯 路徑 5：真人服務 marketplace（產品成熟後）
- 付費讓使用者把夢境發給認證的解夢師 / 心理諮商師看
- app 抽 15–20% 佣金
- 對使用者：得到專業真人回應；對專業者：穩定的個案來源
- **這條路最有想像空間**——把 app 從工具變成生態圈

### 不做的變現方式
- ❌ **美式月訂閱**（NT$99/月直接訂閱）：台灣 C 端工具類訂閱滲透率極低
- ❌ **預設付費牆**：MVP 不要付費牆，所有人免費完整使用
- ❌ **命理 / 開運課程推銷**
- ❌ **NFT / 區塊鏈 / 加密貨幣**
- ❌ **賣使用者資料給廣告平台**

### 何時開始變現？
- 觸發條件（任一達到）：
  1. 月活 > 5,000
  2. 月 API 成本 > NT$15,000
  3. 使用者主動詢問「能不能付費支持」（這是最強訊號）
- 觸發後：**先試路徑 1（一次性報告）**，不直接跳訂閱

---

## 9. AI 成本控制

### Claude API 成本估算（Sonnet 4.6 為例）
- Input：~$3 / 1M tokens
- Output：~$15 / 1M tokens
- 一次解夢估算：input 1500 tokens（system + dream + history）+ output 800 tokens
- 單次成本：≈ $0.0165 USD ≈ NT$0.5

### 省成本手段
1. **Prompt caching**：5 種風格的 system prompt 全部 cached（節省 ~70% input cost）
2. **Haiku 4.5 處理輕量任務**：符號萃取、標籤建議、月度摘要前置處理
3. **Sonnet 4.6 只用於主解讀**
4. **每日軟性上限**（防濫用 / API 失控，不是付費牆）：例如每位使用者每天 10 次解讀
5. **同夢對照功能**：先快取第一次的「夢境 embedding + 結構化萃取」，後續切換風格只跑解讀層，省 input

### 預估每用戶月成本
- 一般用戶：5–10 次/月 = **NT$2.5–5/月**
- 重度用戶：30 次/月 + 月度回顧 = **NT$15–20/月**
- 個人營運期可承受規模：~500–1000 月活重度用戶（API 帳單 NT$10,000 級別）
- 超過此規模再啟動第 8 節的台式變現路徑

---

## 10. 隱私與安全

### 承諾
1. **夢境內容絕不用於訓練模型**（我方與 Anthropic 都是）
2. **Claude API 啟用 zero data retention** 模式
3. **DB 加密儲存**（Supabase 提供 encryption at rest）
4. **應用內密碼鎖**（PIN / 生物辨識）
5. **可隨時匯出與刪除全部資料**
6. **隱私聲明用大白話寫，不藏條款**

### 不做的
- ❌ 任何 SDK 收集除錯誤追蹤（Sentry）與匿名使用統計（PostHog）以外的資料
- ❌ 把使用者資料賣給命理 / 廣告平台
- ❌ 預設開啟夢境分享或社群功能（必須使用者主動同意）

---

## 11. 開發里程碑（Web-First）

| 階段 | 時程 | 內容 |
|---|---|---|
| **Phase 0：原型** | 已完成 | Prompt 設計 + 對照驗證、PRD |
| **Phase 1：骨架** | 第 1 週 | Next.js + Supabase + Claude API 整合，hello world、登入流程 |
| **Phase 2：核心功能** | 第 2–4 週 | 寫夢、解夢、5 風格、同夢對照、歷史列表 |
| **Phase 3：洞察** | 第 5 週 | 符號統計、情緒趨勢、月度回顧 |
| **Phase 4：打磨 + SEO** | 第 6 週 | UX 細節、錯誤處理、SEO 頁面（符號百科） |
| **Phase 5：上線 Web v1.0** | 第 7 週 | Vercel 部署、買域名、開放給朋友圈試用 |
| **Phase 6：養社群 + PWA 強化** | 第 8 週起 | 收回饋、迭代、PWA manifest、推播 |
| **Phase 7：Native App 包裝** | PMF 確立後（建議 D7 留存 > 30%） | Expo / Capacitor port，上架 App Store + Google Play |
| **Phase 8：變現（觸發後再做）** | 月活 > 5,000 或 API 成本 > NT$15,000 後 | 從第 8 節「一次性深度報告」開始試水溫 |

**4–7 週內可上線 Web v1.0**（單人開發 + AI 協作節奏，比 native 快很多）。
等 PMF 訊號出現再投資 native；變現再等更後面，**不卡開發節奏**。

---

## 12. 風險與待驗證假設

| 風險 / 假設 | 驗證方式 |
|---|---|
| AI 解讀品質夠不夠？ | 找 10 位 beta 使用者連續用 2 週收回饋（這是 MVP 階段最重要的驗證） |
| 「同夢對照」是不是真的會被使用、被分享？ | 上架後看每篇日記平均產生幾種風格解讀、看分享行為 |
| 留存率（D7 / D30）能不能撐起未來變現？ | PostHog 監測，目標 D7 > 30%、D30 > 15% |
| 中文 SEO 起得來嗎？（搶 Web 流量） | 寫 50 篇符號解析長文章驅動 SEO |
| Apple App Store 是否會分類為命理 / 18+？ | 上架時定位「自我探索 / 心理健康」並準備兩套素材 |
| 失眠/焦慮使用者出現紅旗該怎麼處理？ | 在認知派解讀加 escalation 機制（顯示專業協助資源） |
| 變現時機到了，台灣使用者吃哪一種變現？ | 觸發後 A/B 測試「一次性深度報告」vs「點數加值包」vs「廣告」哪個 ARPU 高 |

---

## 13. 命名（待定）

候選名稱（中英文都可）：
- 解夢日記（直接，但通用）
- 夢境 / Yumi
- 夢之鏡 / Mirror
- 夢徑 / Pathway
- DreamLayer（強調多層解讀）
- Mirrors（強調同一個夢的多視角）
- 夜書
- **Onirio**（拉丁字根 oneiros = 夢）

→ 命名留待 D 階段建專案前再決定。建議先用 codename **`oneiro`** 開發。

---

## 14. 下一步

✅ A. 多風格 prompt 原型（已完成）
✅ B. 寫產品規格書 + MVP 功能清單（本文件）
⬜ C. 深入分析 BabyMall（補完競品情報）
⬜ D. 建專案骨架（Expo + Supabase + Claude API）
