# Changelog

本文件記錄所有版本的變更，格式依照 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 規範。

版本號規則 (Semantic Versioning)：
- **MAJOR**：不相容的重大架構變更
- **MINOR**：新增功能（向下相容）
- **PATCH**：Bug 修復、文件補充、小幅調整

---

## [Unreleased] — 開發中

### 規劃中
- Phase 2：問卷 B 市場調查（市調前端頁面 + API）

---

## [0.7.2] — 2026-07-22

### Performance（效能優化）
- **後台 Dashboard 渲染與查詢效能提升**：
  - 將 `/admin/dashboard` 從 Client Component 遷移為 React Server Component（RSC），消除二次 fetch 與客戶端等待來回（RTT），頁面首次加載即完成全數據渲染。
  - 重構 `SurveyService.getSatisfactionStats()`，採用 Prisma `aggregate` 及 `groupBy` 將統計運算直接交由 SQLite 處理，大幅降低伺服器記憶體開銷與查詢延遲。

### Fixed（修復）
- **修復 ISO 週數格式化跨年 Bug**：
  - 於 `SurveyService.getWeekLabel` 輸出格式補上年份資訊（`YYYY-WNN`），防止跨年度相同週數 Key 發生碰撞。

---

## [0.7.1] — 2026-07-21


### Fixed（修復）
- **解決啟動腳本執行異常問題**：
  - 修復 `start.bat` 因 port 3000 被 stale 服務佔用導致 `ERR_CONNECTION_REFUSED` 錯誤。新增自動偵測並清除 port 3000 衝突程序機制。
  - 將 Next.js 開發伺服器執行方式從「最小化背景執行」改為「獨立可見視窗執行」，並採用 `cmd /k`，防止伺服器啟動出錯時視窗自動關閉而無法除錯。
  - 新增伺服器啟動就緒偵測迴圈（最長 15 秒），確保 port 3000 開始監聽後才自動打開瀏覽器頁面，避免提早開啟網頁造成連線失敗。
- **修復預設場次代碼時區問題**：
  - 將 `SurveyForm` 預設場次與 CSV 匯出檔名的日期，由 UTC 時間（`toISOString()`）修正為瀏覽器/伺服器當下的本地時間日期，解決清晨或深夜時填寫問卷時產生日期偏差的 Bug。

### Changed（修改）
- **相容 Next.js 16 新規範**：
  - 將已棄用的全域中介層 `src/middleware.ts` 遷移至新版 `src/proxy.ts`，並將匯出函式 `middleware` 更名為 `proxy`，以符合 Next.js 16 最新代理架構設計。
  - 同步修正所有功能計畫與 SOP 文件中關於 middleware 的路徑與描述。
- **文件與快速開始說明優化**：
  - 更新 `README.md`，在快速開始章節中新增 `start.bat` 一鍵啟動的完整指南。

---

## [0.7.0] — 2026-07-20

### Added（新增）
- **後台 CSV 資料匯出功能**：
  - 開發 `/api/admin/export` API 端點，動態拉取滿意度問卷紀錄，並將欄位編碼為相容 Excel 的 UTF-8 BOM 格式。
  - 在 API 端點整合 `authorizeAdmin` 進行 JWT 角色權限安全檢核。
  - 在明細表格 `ResponseTable` 標頭新增「匯出 CSV 📥」按鈕，觸發瀏覽器下載。
- **一鍵啟動腳本**：
  - 於專案根目錄建立 `start.bat` 指令檔，雙擊即可在背景/最小化執行 Next.js 開發伺服器，並同時自動在瀏覽器中開啟問卷填寫頁與後台登入頁。
  - 建立功能計畫 (`PLAN.md`)。

---

## [0.6.0] — 2026-07-20

### Added（新增）
- **管理後台儀表板系統**：
  - 開發 `/api/admin/stats` 與 `/api/admin/responses` API 端點，提供滿意度統計與歷史明細。
  - 設計權限防禦輔助函式 `authorizeAdmin`，在後台 API 端點進行嚴格的 JWT 角色（RBAC）檢驗。
  - 建立 `/admin` 佈局與側邊欄元件（含安全登出按鈕）。
  - 建立儀表板 KPI 指標卡片 `StatsCards`（顯示 NPS 與滿意度平均星評）。
  - 以輕量化、極速的 SVG 渲染方式繪製 NPS 週趨勢折線圖與狗狗狀態分佈圖。
  - 實作「低分警示區」元件 `AlertList`，顯眼呈現 NPS ≤ 6 批評者回饋。
  - 實作「明細記錄」元件 `ResponseTable`，提供模糊搜尋以快速查驗場次或回饋。
  - 重構 `survey.service.ts` 的滿意度分析與週趨勢記憶體分組計算邏輯。
  - 更新單元測試 `survey.service.test.ts` 以確保新回傳屬性通過測試驗證。
  - 建立功能計畫 (`PLAN.md`) 與 SOP 文件 (`admin-dashboard-SOP.md`)。

---

## [0.5.0] — 2026-07-17

### Added（新增）
- **管理員登入與 JWT 認證系統**：
  - 開發 `/api/auth/login` 與 `/api/auth/logout` API，實作 JWT 簽發與 HttpOnly Cookie。
  - 實作密碼雜湊與比對服務 `AuthService`（整合 `bcryptjs`）。
  - 在 `User` 資料模型中預留 2FA（二次驗證）所需的 `twoFactorEnabled` 與 `twoFactorSecret` 欄位並順利遷移。
  - 設計 `src/middleware.ts` 全域防護中介層，Edge-safe 方式解析 JWT 進行 `/admin` 路由保護。
  - 建立 `/login` 登入頁面 UI（與 Next.js 歡迎頁完成整合導向）。
  - 編寫 `auth.service.test.ts` 單元測試（實作 3 項測試，覆蓋率 100%）。
  - 建立開發功能計畫 (`PLAN.md`) 與 SOP 文件 (`admin-auth-SOP.md`)。
  - 新增資料庫種子 `prisma/seed.ts`，並在 `prisma.config.ts` 中配置自動 Seed 運行。

---

## [0.4.0] — 2026-07-17

### Added（新增）
- **問卷 A 服務滿意度系統**：
  - Next.js 15 + TypeScript + Tailwind CSS 專案初始化與結構佈署。
  - Prisma Schema 與 SQLite 資料庫設定，完成 `User`, `Client`, `Dog`, `SurveySatisfaction`, `SurveyMarket`, `CareLog` 等 models 建置。
  - 完成 `POST /api/survey/satisfaction` API 端點與 Zod Schema 驗證。
  - 完成 `SurveyForm`, `StarRating`, `NpsSlider`, `DogConditionSelector` 等 React 手機優先問卷元件。
  - 建立 `/survey` 入口頁與 `/success` 感謝頁。
  - 撰寫 `survey.service.ts` 數據處理服務並實作 3 項單元測試，測試通過率 100%。
  - 建立功能計畫 (`docs/features/survey-satisfaction/PLAN.md`) 與 SOP 文件 (`docs/sop/survey-satisfaction-SOP.md`)。

---

## [0.3.0] — 2026-07-17

### Added（新增）
- **專案開發進度追蹤表** (`progress_tracker.csv`)：採用 UTF-8 BOM 編碼之 CSV 格式，追蹤各階段任務的狀態、日期、DOD、SOP 與資安核對。
- **SKILL 規則修訂**：
  - 新增「🚨 動工前強制閱讀（任何動作均適用）」於 `SKILL.md`，強制要求每次動工前必須閱讀並確認當前對話中的 `implementation_plan.md`，否則視為無效提交。
  - 新增「📄 Implementation Plan 位置」說明。

### Changed（修改）
- `SKILL.md`：重新編排強制規則表，將「確認動工前清單」列為強制規則第 1 條。
- `README.md`：更新專案結構，加入 `progress_tracker.csv`。

---

## [0.2.0] — 2026-07-17

### Added（新增）
- **SKILL Part 7：資訊安全規範** (`.agents/skills/doggie-dev/references/07-security.md`)
  - 資安威脅清單與嚴重程度評級
  - JWT HttpOnly Cookie 強制規範（禁止 localStorage）
  - Zod 輸入驗證規範（所有 API 強制套用）
  - HTTP 安全標頭配置（CSP、X-Frame-Options 等）
  - Rate Limiting 規範（登入 5次/分、問卷 20次/時）
  - 個人資料保護合規措施（個資法同意文字範本）
  - 版控安全規範（`.env` 防洩漏確認流程）
  - 套件漏洞定期掃描（`npm audit`）
  - **10 點資安 Checklist**（每個功能上線前必須全數通過）

### Changed（修改）
- `SKILL.md`：索引新增 Part 7 條目
- `SKILL.md`：強制規則新增第 6、7、8 條（Zod 驗證、HttpOnly Cookie、資安 Checklist）
- `README.md`：「開發前必讀」新增 Part 7 連結

---

## [0.1.0] — 2026-07-17

### Added（新增）

#### 工程規範（SKILL）
- **SKILL 主入口** (`.agents/skills/doggie-dev/SKILL.md`)
  - 專案規範索引與 8 條強制規則總覽
- **Part 1：技術架構** (`references/01-architecture.md`)
  - 技術棧選型（Next.js 15 + TypeScript + Prisma + shadcn/ui）
  - 強制目錄結構規範
  - `.env` 環境變數設計（Phase 1 本地 → Phase 3 雲端切換）
  - 三階段開發計畫（Phase 1/2/3）
- **Part 2：程式碼規範** (`references/02-coding-standards.md`)
  - **100 行上限**強制規範（含處理方式）
  - 三層架構設計模式（Route → Service → DB）
  - 全專案統一命名規範（檔案、函式、常數、型別、URL）
  - TypeScript 禁止 `any` 規範
  - 注釋撰寫規範（說明「為什麼」而非「做什麼」）
- **Part 3：錯誤日誌** (`references/03-error-logging.md`)
  - pino 日誌庫設定（JSON 結構化輸出）
  - 日誌層級規範（DEBUG/INFO/WARN/ERROR/FATAL）
  - 統一錯誤代碼系統（AUTH_001、SURVEY_001 等）
  - 統一 API 錯誤回應格式（`ApiResponse<T>`）
  - 生產環境日誌輸出策略（日誌 rotate 30 天）
  - React Error Boundary 規範
- **Part 4：測試策略** (`references/04-testing.md`)
  - 工具選型（Vitest 單元測試 + Playwright E2E）
  - 分層覆蓋率目標（Service 層 ≥ 90%、API ≥ 80%）
  - AAA 測試模式（Arrange / Act / Assert）
  - `data-testid` 命名規範
  - 測試執行指令
- **Part 5：Debug 方法** (`references/05-debugging.md`)
  - 四步驟標準 Debug 流程（依問題層次分類）
  - VS Code Debugger 設定檔
  - Prisma Studio 資料庫直視工具
  - 常見錯誤快速查詢表
  - 臨時 Debug 日誌 `// TODO: remove debug` 約定
- **Part 6：功能開發 SOP** (`references/06-feature-workflow.md`)
  - 強制 6 步驟開發流程（閱讀 SKILL → Plan → 實作 → 測試 → SOP → Walkthrough）
  - Feature Plan 標準模板（含 API 設計、DB 異動、Definition of Done）
  - SOP 文件標準模板（含流程圖、相關檔案、常見問題）
  - `docs/` 目錄結構規範

#### 專案基礎設定
- `.gitignore`：排除 `.env`、`*.db`、`node_modules/`、`logs/` 等敏感檔案
- `README.md`：專案說明、技術棧、快速啟動指南、SKILL 連結

---

## 文件維護規則

> **強制規定**：每次有以下變更，**必須同步更新本 Changelog**：

| 變更類型 | Changelog Section | 範例 |
|---------|------------------|------|
| 新增功能 | `### Added` | 新增問卷 A 提交 API |
| 修改現有功能 | `### Changed` | 修改 NPS 計算邏輯 |
| 棄用功能 | `### Deprecated` | 標記舊版 API 為棄用 |
| 移除功能 | `### Removed` | 移除 Express 後端 |
| Bug 修復 | `### Fixed` | 修復問卷提交後未導頁 |
| 安全性修補 | `### Security` | 修補 JWT 驗證漏洞 |
| 文件更新 | `### Documentation` | 更新 SKILL Part 3 |
