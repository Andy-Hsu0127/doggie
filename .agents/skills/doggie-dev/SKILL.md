---
name: doggie-dev
description: >
  Development standards, engineering workflow, and coding conventions for the
  Doggie dog care website project. Triggers for any development task related to
  this project: satisfaction survey, admin dashboard, market research system,
  CRM, booking system, and official website.
---

# Doggie Dev SKILL — 主規範索引

> **核心原則**：每一個功能從規劃到產出，都遵循完整的工作流程。程式碼為未來維護者而寫，不只是為了讓它現在能跑。

---

## 🗂️ 規範分章索引（必須依序閱讀）

在開始任何開發任務前，**必須**閱讀以下所有 Part：

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

## ⚡ 快速強制規則（違反即停止）

以下規則無論任何情況都**不可違反**：

1. **任何單一檔案不得超過 100 行**（包含空白行與注釋）
2. **每個功能開發前，必須先產出 Feature Plan 並獲得確認**
3. **每個完成的功能，必須附帶 SOP 文件**
4. **所有對外 API 必須有角色權限驗證（RBAC）**
5. **所有收集個人資料的功能，必須有個資法同意記錄**
6. **所有 API 輸入必須通過 Zod Schema 驗證**
7. **JWT 必須存在 HttpOnly Cookie，禁止存在 localStorage**
8. **每個功能上線前必須通過 Part 7 的資安 Checklist**
9. **每次新增/修改功能，必須同步更新 `CHANGELOG.md` 與 `README.md`**
10. **命名規範必須全專案一致**（詳見 Part 2）

---

## 🏗️ 專案現況快覽

```
專案根目錄：p:\doggie\
目前 Phase：Phase 1（滿意度調查系統）
框架：Next.js 15 (App Router) + TypeScript
資料庫：Prisma + SQLite（未來遷移至 PostgreSQL）
UI：Tailwind CSS + shadcn/ui
```
