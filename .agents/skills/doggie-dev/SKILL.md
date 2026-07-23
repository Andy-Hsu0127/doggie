---
name: doggie-dev
description: >
  Development standards, engineering workflow, and coding conventions for the
  Doggie dog care website project. Triggers for any development task related to
  this project: satisfaction survey, admin dashboard, market research system,
  CRM, booking system, and official website.
---

# Doggie Dev SKILL — 主規範索引

---

## 🚨 動工前強制閱讀（任何動作均適用）

> **不論是新增功能、修改程式碼、更新文件、修 Bug、調整設定、甚至只是重新命名一個檔案——在動任何一個檔案之前，必須完成以下所有項目的確認。違者視為無效提交。**

### 📋 動工前必確認清單（每次都要過一遍）

**Step 0A — 閱讀本 SKILL 全文**
- [ ] 已閱讀 Part 1：技術架構（目錄結構、技術棧、Phase 規劃）
- [ ] 已閱讀 Part 2：程式碼規範（100 行限制、命名規範、設計模式）
- [ ] 已閱讀 Part 3：錯誤日誌（Logger 使用、錯誤代碼、API 回應格式）
- [ ] 已閱讀 Part 4：測試策略（工具選型、覆蓋率目標、命名規範）
- [ ] 已閱讀 Part 5：Debug 方法（除錯流程、工具配置）
- [ ] 已閱讀 Part 6：功能開發 SOP（9 步驟流程、Feature Plan 模板、SOP 模板）
- [ ] 已閱讀 Part 7：資安規範（Zod 驗證、JWT 設定、資安 Checklist）

**Step 0B — 閱讀並確認 Implementation Plan**
- [ ] 已閱讀當前的 `implementation_plan.md`（位於對話 Artifacts 目錄）
- [ ] 確認本次動作符合 Plan 中定義的 Phase 與功能範圍
- [ ] 若本次動作不在 Plan 範圍內，必須先更新 Plan 並獲得確認，才可繼續

**Step 0C — 確認本次動作的影響範圍**
- [ ] 確認涉及的檔案清單（新增/修改/刪除）
- [ ] 確認是否影響資料庫 Schema（影響則需 `prisma migrate`）
- [ ] 確認是否影響 API 介面（影響則需更新 SOP 文件）
- [ ] 確認是否涉及個人資料（涉及則需個資法同意機制）

> ⛔ **以上任何一項未確認，即不得開始動工。**

---

## 🗂️ 規範分章索引

| Part | 檔案 | 內容摘要 |
|------|------|---------|
| **Part 1** | [references/01-architecture.md](references/01-architecture.md) | 技術棧、目錄結構、Phase 規劃 |
| **Part 2** | [references/02-coding-standards.md](references/02-coding-standards.md) | 100 行限制、設計模式、命名規範 |
| **Part 3** | [references/03-error-logging.md](references/03-error-logging.md) | 錯誤處理、日誌系統、錯誤代碼 |
| **Part 4** | [references/04-testing.md](references/04-testing.md) | 測試策略、工具、覆蓋率目標 |
| **Part 5** | [references/05-debugging.md](references/05-debugging.md) | 快速 Debug 方法、工具配置 |
| **Part 6** | [references/06-feature-workflow.md](references/06-feature-workflow.md) | 功能開發 SOP（計畫 → 實作 → 文件） |
| **Part 7** | [references/07-security.md](references/07-security.md) | 資訊安全規範、個資合規、資安 Checklist |

---

## ⚡ 強制規則（違反即停止，不得例外）

| # | 規則 | 參考 |
|---|------|------|
| 1 | 任何動作前必須完成上方「動工前必確認清單」 | Step 0A/0B/0C |
| 2 | 任何單一檔案不得超過 **100 行** | Part 2 |
| 3 | 每個功能開發前必須先產出 **Feature Plan** 並獲得確認 | Part 6 |
| 4 | 每個完成的功能必須附帶 **SOP 文件** | Part 6 |
| 5 | 所有對外 API 必須有 **RBAC 角色權限驗證** | Part 7 |
| 6 | 所有 API 輸入必須通過 **Zod Schema 驗證** | Part 7 |
| 7 | JWT 必須存在 **HttpOnly Cookie**，禁止存在 localStorage | Part 7 |
| 8 | 每個功能上線前必須通過 **Part 7 資安 Checklist** | Part 7 |
| 9 | 每次任何變更必須同步更新 **`CHANGELOG.md` 與 `README.md`** | Part 6 |
| 10 | 所有收集個人資料的功能必須有 **個資法同意記錄** | Part 7 |
| 11 | **命名規範**必須全專案一致 | Part 2 |
| 12 | **禁止隨意亂產檔案**：嚴禁隨意產出未授權雜檔，根目錄僅留 `control.bat` | AGENTS.md |
| 13 | **先提案後動工**：修改 Code / 安裝套件前必須先提出優化方案，經確認授權後才可執行 | AGENTS.md |

---


## 🏗️ 專案現況快覽

```
專案根目錄：p:\doggie\
目前 Phase：Phase 1（滿意度調查系統）
框架：Next.js 15 (App Router) + TypeScript
資料庫：Prisma + SQLite（未來遷移至 PostgreSQL）
UI：Tailwind CSS + shadcn/ui
```

---

## 📄 Implementation Plan 位置

每次動工前必須確認最新版本的 Implementation Plan：

- **對話 Artifacts 目錄**：由 Antigravity 在每次開發周期開始時產出並更新
- **內容包含**：功能範圍、API 設計、資料庫異動、驗證計畫
- **若 Plan 過期或不存在**：必須先要求產出新的 Plan，確認後才可動工
