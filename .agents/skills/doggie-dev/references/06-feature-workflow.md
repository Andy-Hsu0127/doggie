# Part 6 — 功能開發 SOP（計畫 → 實作 → 文件）

## 6.1 強制工作流程（每個功能都必須遵守）

```
Step 1：閱讀 SKILL     → 確認架構規範
Step 2：產出 Feature Plan → 取得確認
Step 3：實作           → 遵守所有 Part 1–5 規範
Step 4：測試           → 符合 Part 4 覆蓋率目標
Step 5：產出 SOP 文件  → 存入 docs/
Step 6：更新 Walkthrough → 記錄完成狀態
```

> **禁止**在未獲得 Feature Plan 確認前開始寫程式碼。

---

## 6.2 Feature Plan 模板

**位置：`docs/features/<feature-name>/PLAN.md`**
**命名規則**：`feature-name` 使用 `kebab-case`

```markdown
# Feature Plan：[功能名稱]

## 功能描述
（一段話說明這個功能做什麼、為什麼需要它）

## 所屬 Phase
Phase 1 / 2 / 3

## 影響的檔案清單

### 新增檔案
- `src/app/api/survey/satisfaction/route.ts`
- `src/services/survey.service.ts`

### 修改檔案
- `prisma/schema.prisma`（新增 SurveySatisfaction model）

### 刪除檔案
- 無

## API 設計（如有新增）
| Method | Endpoint | 說明 | 權限 |
|--------|---------|------|------|
| POST | /api/survey/satisfaction | 提交滿意度問卷 | 公開 |
| GET  | /api/admin/stats | 取得統計數據 | SUPER_ADMIN |

## 資料庫異動（如有）
（列出新增/修改的 Prisma model 欄位）

## 驗證標準（Definition of Done）
- [ ] API 回傳格式符合 `ApiResponse<T>` 型別
- [ ] Service 層測試覆蓋率 ≥ 90%
- [ ] E2E 測試涵蓋主要用戶流程
- [ ] `npm run type-check` 零錯誤
- [ ] 所有 console.log 已移除
- [ ] 單一檔案不超過 100 行
- [ ] SOP 文件已產出
```

---

## 6.3 SOP 文件模板

**位置：`docs/sop/<feature-name>-SOP.md`**

```markdown
# SOP：[功能名稱]

**版本**：v1.0
**建立日期**：YYYY-MM-DD
**最後更新**：YYYY-MM-DD
**負責人**：（您的名稱）

---

## 功能說明
（一段話說明這個功能的用途）

## 系統流程圖

\`\`\`
飼主 → 點開問卷連結 → 填寫問卷 → 提交
                                    ↓
                            POST /api/survey/satisfaction
                                    ↓
                            SurveyService.create()
                                    ↓
                            Prisma 寫入 SQLite
                                    ↓
                            回傳成功 → 導向 /success
\`\`\`

## 相關檔案
| 檔案 | 說明 |
|------|------|
| `src/app/(public)/survey/page.tsx` | 問卷前端頁面 |
| `src/app/api/survey/satisfaction/route.ts` | API 端點 |
| `src/services/survey.service.ts` | 業務邏輯 |

## 環境變數需求
| 變數 | 說明 | 是否必填 |
|------|------|---------|
| `DATABASE_URL` | SQLite 資料庫路徑 | ✅ 必填 |

## 常見問題與解法
| 問題 | 解法 |
|------|------|
| 提交後資料沒寫入 DB | 執行 `npx prisma studio` 確認連線是否正常 |
| 個資同意 checkbox 未勾就能提交 | 確認前端有 `required` 屬性，後端有 `CONSENT_REQUIRED` 驗證 |

## 未來擴充注意事項
（記錄這個功能未來可能需要調整的地方）
```

---

## 6.4 docs 目錄結構

```
docs/
├── features/                     ← Feature Plan（開發前產出）
│   ├── survey-satisfaction/
│   │   └── PLAN.md
│   └── admin-dashboard/
│       └── PLAN.md
│
└── sop/                          ← SOP 文件（功能完成後產出）
    ├── survey-satisfaction-SOP.md
    └── admin-dashboard-SOP.md
```

---

## 6.5 Walkthrough 更新規範

每個功能完成後，在對話的 `walkthrough.md` 中新增一條記錄：

```markdown
## ✅ [功能名稱] — YYYY-MM-DD

- **完成內容**：（一行摘要）
- **測試結果**：所有測試通過 / 覆蓋率 XX%
- **相關文件**：[SOP](docs/sop/xxx-SOP.md) | [Plan](docs/features/xxx/PLAN.md)
- **備註**：（任何需要下次注意的事項）
```
