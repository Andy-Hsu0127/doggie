# Changelog

本文件記錄所有版本的變更，格式依照 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 規範。

版本號規則 (Semantic Versioning)：
- **MAJOR**：不相容的重大架構變更
- **MINOR**：新增功能（向下相容）
- **PATCH**：Bug 修復、文件補充、小幅調整

---

## [Unreleased] — 開發中

### 規劃中
- Phase 1：管理員後台儀表板（登入 + NPS 圖表 + 低分警示）
- Phase 1：CSV 匯出功能

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
