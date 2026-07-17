# Part 1 — 技術架構與目錄結構

## 1.1 技術棧（全階段通用）

| 層次 | 技術 | 版本 | 說明 |
|------|------|------|------|
| **全端框架** | Next.js (App Router) | 15.x | 前後端一體，API Routes 取代獨立 Express |
| **語言** | TypeScript | 5.x | 強型別，減少執行期錯誤 |
| **UI 框架** | Tailwind CSS | 3.x | Utility-first，搭配 shadcn/ui |
| **元件庫** | shadcn/ui | Latest | 原始碼歸專案所有，100% 可客製 |
| **圖表** | Recharts | 2.x | shadcn/ui 官方整合圖表 |
| **ORM** | Prisma | 5.x | SQLite（Phase 1）→ PostgreSQL（Phase 3） |
| **認證** | JWT + bcrypt | — | RBAC 角色權限，可擴充多帳號 |
| **字體** | Noto Sans TC + Inter | — | Google Fonts，繁體中文支援 |

**切換資料庫只需改 `schema.prisma` 一行：**
```prisma
// Phase 1
datasource db { provider = "sqlite" }
// Phase 3 → 改為：
datasource db { provider = "postgresql" }
```

---

## 1.2 目錄結構（強制遵守）

```
p:\doggie\
├── .env                          ← 環境變數（不進版控）
├── .env.example                  ← 範本（進版控）
├── .gitignore
│
├── prisma\
│   ├── schema.prisma             ← 資料庫 Schema
│   ├── seed.ts                   ← 初始資料（測試帳號等）
│   └── migrations\               ← 自動生成，不手動修改
│
├── src\
│   ├── app\                      ← Next.js App Router
│   │   ├── (public)\             ← 前台：問卷、成功頁
│   │   │   ├── survey\
│   │   │   └── success\
│   │   ├── (admin)\              ← 後台：需登入
│   │   │   ├── login\
│   │   │   └── dashboard\
│   │   └── api\                  ← 後端 API Routes
│   │       ├── auth\
│   │       ├── survey\
│   │       └── admin\
│   │
│   ├── components\               ← 可複用 UI 元件
│   │   ├── ui\                   ← shadcn/ui 原始元件（不直接修改）
│   │   ├── survey\               ← 問卷相關元件
│   │   ├── dashboard\            ← 後台相關元件
│   │   └── shared\              ← 全站共用元件
│   │
│   ├── lib\                      ← 工具函式與設定
│   │   ├── db.ts                 ← Prisma Client 單例
│   │   ├── auth.ts               ← JWT 工具函式
│   │   ├── logger.ts             ← 日誌工具（見 Part 3）
│   │   └── utils.ts              ← 通用工具函式
│   │
│   ├── services\                 ← 業務邏輯層（不含 HTTP 邏輯）
│   │   ├── survey.service.ts
│   │   ├── analytics.service.ts
│   │   └── auth.service.ts
│   │
│   ├── types\                    ← TypeScript 型別定義
│   │   ├── survey.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts
│   │
│   └── constants\                ← 全域常數
│       ├── roles.ts              ← RBAC 角色定義
│       └── errors.ts             ← 錯誤代碼定義
│
├── tests\                        ← 測試檔案（見 Part 4）
│   ├── unit\
│   ├── integration\
│   └── e2e\
│
└── docs\                         ← 功能文件與 SOP（見 Part 6）
    ├── features\
    └── sop\
```

---

## 1.3 環境變數規範（`.env`）

```bash
# ── 環境識別 ──
NODE_ENV=development              # development | production

# ── 伺服器 ──
PORT=3000
# Phase 1（本地）：
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Phase 3（上線）：改為正式網域

# ── 資料庫 ──
# Phase 1：
DATABASE_URL="file:./prisma/doggie.db"
# Phase 3：
# DATABASE_URL="postgresql://user:pass@host:5432/doggie"

# ── 認證 ──
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# ── 預留（Phase 3）──
# LINE_CHANNEL_TOKEN=
# SMTP_HOST=
```

---

## 1.4 三階段開發計畫

| Phase | 目標 | 主要功能 | 資料庫 |
|-------|------|---------|--------|
| **1（現在）** | 滿意度調查 + 後台 | 問卷 A、NPS 後台、低分警示 | SQLite |
| **2（近期）** | 市調擴大 + CRM | 問卷 B、客戶管理、多帳號 | SQLite |
| **3（未來）** | 正式官網 + 場館 | 預約系統、會員中心、金流 | PostgreSQL |
