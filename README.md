# 🐾 Doggie — 毛孩照護系統

> 專業的狗狗照顧服務網站，包含客戶滿意度調查、市場調查系統與管理後台。

📋 **[查看完整 Changelog](CHANGELOG.md)** — 所有版本變更都記錄於此

---

## 📌 專案說明

本專案為三階段開發的狗狗照顧服務平台：

| Phase | 狀態 | 說明 |
|-------|------|------|
| **Phase 1** | 🔨 開發中 | 客戶滿意度調查 + 管理後台 |
| **Phase 2** | 📋 規劃中 | 市場調查系統 + 客戶 CRM |
| **Phase 3** | 🔮 未來 | 正式官網 + 預約系統 + 會員中心 |

---

## 🛠️ 技術棧

- **框架**：Next.js 15 (App Router) + TypeScript
- **UI**：Tailwind CSS + shadcn/ui
- **資料庫**：Prisma ORM + SQLite（→ PostgreSQL）
- **認證**：JWT + RBAC 角色權限

---

## 🚀 快速開始

### ⚡ 方式 A：一鍵啟動 (Windows 推薦)

在 Windows 系統下，您可直接雙擊專案根目錄的 `start.bat`。該腳本會：
1. 自動檢查並安裝相依套件 (`npm install`)。
2. 自動檢查並執行資料庫遷移與 Seed (`prisma migrate dev`)。
3. 自動清理 port 3000 殘留的伺服器程序，以避免衝突。
4. 啟動開發伺服器並在瀏覽器自動開啟前台問卷與後台登入頁。

### 💻 方式 B：手動啟動 (開發者)

```bash
# 1. 複製環境變數範本
cp .env.example .env
# 編輯 .env，填入必要設定

# 2. 安裝套件
npm install

# 3. 初始化資料庫
npx prisma migrate dev --name init

# 4. 啟動開發伺服器
npm run dev

# 5. 執行單元與整合測試
npm run test
```

開啟瀏覽器：
- 問卷頁面：`http://localhost:3000/survey`
- 管理後台：`http://localhost:3000/admin`

---

## 📂 專案結構

```
doggie/
├── .agents/skills/doggie-dev/  ← AI 開發規範（SKILL）
├── prisma/                     ← 資料庫 Schema
├── src/
│   ├── app/                    ← Next.js 頁面與 API
│   ├── components/             ← UI 元件
│   ├── services/               ← 業務邏輯層
│   ├── lib/                    ← 工具函式
│   └── types/                  ← TypeScript 型別
├── tests/                      ← 測試檔案
├── docs/                       ← 功能文件與 SOP
└── progress_tracker.csv        ← 專案開發進度追蹤表 (Excel 相容)
```

---

## 📋 開發規範

本專案使用 Antigravity SKILL 管理開發規範，詳見 [`.agents/skills/doggie-dev/SKILL.md`](.agents/skills/doggie-dev/SKILL.md)。

**開發前必讀：**
- [Part 1：技術架構](.agents/skills/doggie-dev/references/01-architecture.md)
- [Part 2：程式碼規範](.agents/skills/doggie-dev/references/02-coding-standards.md)
- [Part 3：錯誤日誌](.agents/skills/doggie-dev/references/03-error-logging.md)
- [Part 4：測試策略](.agents/skills/doggie-dev/references/04-testing.md)
- [Part 5：Debug 方法](.agents/skills/doggie-dev/references/05-debugging.md)
- [Part 6：功能開發 SOP](.agents/skills/doggie-dev/references/06-feature-workflow.md)
- [Part 7：資訊安全規範](.agents/skills/doggie-dev/references/07-security.md)

---

## ⚖️ 個人資料保護

本系統依台灣《個人資料保護法》設計，所有問卷均設有同意聲明機制。
