# Feature Plan：問卷 A 服務滿意度系統 (survey-satisfaction)

## 功能描述
建立現有飼主的「服務滿意度調查問卷」系統。飼主可在接送完成後，透過 LINE 點擊專屬連結進入問卷，填寫服務評分（1–5 星）、狗狗精神狀況、NPS 推薦度（0–10 分）並勾選個資法同意聲明後提交。資料將儲存至 SQLite 資料庫，為後台分析與未來 CRM 系統奠定基礎。

## 所屬 Phase
Phase 1 (滿意度調查與基礎建設)

## 影響的檔案清單

### 新增檔案
- **專案基礎設定與環境建立**：
  - `package.json` / `tsconfig.json` / `next.config.ts` (Next.js 15 專案初始化)
  - `prisma/schema.prisma` (資料庫結構定義)
  - `src/lib/db.ts` (Prisma Client 單例連線)
  - `src/lib/logger.ts` (Pino 結構化日誌工具)
  - `src/constants/errors.ts` (統一錯誤代碼)
  - `src/types/api.types.ts` (統一 API 回應型別)
- **問卷業務邏輯與 API**：
  - `src/types/survey.types.ts` (問卷相關型別與 Zod 驗證 Schema)
  - `src/services/survey.service.ts` (問卷資料寫入與處理邏輯)
  - `src/app/api/survey/satisfaction/route.ts` (問卷提交 API 端點)
- **問卷前端頁面與元件**：
  - `src/app/(public)/survey/page.tsx` (問卷填寫頁)
  - `src/app/(public)/success/page.tsx` (提交成功感謝頁)
  - `src/components/survey/SurveyForm.tsx` (問卷表單主元件)
  - `src/components/survey/StarRating.tsx` (星評元件)
  - `src/components/survey/NpsSlider.tsx` (NPS 滑桿元件)
- **測試檔案**：
  - `tests/unit/services/survey.service.test.ts` (Service 單元測試)
  - `tests/e2e/survey-flow.spec.ts` (E2E 流程測試)

### 修改檔案
- `README.md` (新增安裝與開發步驟說明)
- `CHANGELOG.md` (新增 v0.3.0 開發中記錄)

### 刪除檔案
- 無

---

## API 設計
| Method | Endpoint | 說明 | 權限 |
|--------|---------|------|------|
| POST | `/api/survey/satisfaction` | 提交服務滿意度問卷 | 公開 (Public) |

### 請求 Body 格式 (JSON)
```json
{
  "sessionLabel": "2026-07-17",
  "ratingOverall": 5,
  "ratingStaff": 4,
  "dogCondition": "GREAT",
  "npsScore": 9,
  "feedback": "狗狗回家後很開心，接送很準時！",
  "hasConsented": true
}
```

### 回應格式 (JSON)
* **成功 (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "submittedAt": "2026-07-17T08:00:00.000Z"
    }
  }
  ```
* **失敗 (400 Bad Request - 驗證失敗)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATE_INVALID_FORMAT",
      "message": "必須勾選同意個資法聲明才能提交問卷"
    }
  }
  ```

---

## 資料庫異動 (Prisma Schema)
新增以下 models 至 `prisma/schema.prisma`：

```prisma
model Client {
  id        Int                  @id @default(autoincrement())
  name      String
  lineName  String?
  phone     String?
  dogs      Dog[]
  surveys   SurveySatisfaction[]
  createdAt DateTime             @default(now())
}

model Dog {
  id        Int      @id @default(autoincrement())
  client    Client   @relation(fields: [clientId], references: [id])
  clientId  Int
  name      String
  breed     String?
  size      DogSize
  birthYear Int?
  notes     String?
}

enum DogSize {
  SMALL
  MEDIUM
  LARGE
}

model SurveySatisfaction {
  id            Int      @id @default(autoincrement())
  client        Client?  @relation(fields: [clientId], references: [id])
  clientId      Int?
  sessionLabel  String   // 接送場次標籤，例如 "2026-07-17"
  ratingOverall Int      // 1-5
  ratingStaff   Int      // 1-5
  dogCondition  String   // "GREAT" | "NORMAL" | "CONCERN"
  npsScore      Int      // 0-10
  feedback      String?
  consented     Boolean  @default(true)
  submittedAt   DateTime @default(now())
}
```

---

## 驗證標準 (Definition of Done)
- [x] 遵守動工前強制閱讀清單 (Step 0A/0B/0C)
- [ ] API 請求與回應均符合 `ApiResponse<T>` 格式
- [ ] 所有輸入均使用 Zod 進行 schema 驗證 (強制規則 6)
- [ ] 限制單一檔案不得超過 100 行 (強制規則 2)
- [ ] `survey.service.ts` 的單元測試覆蓋率達 90% 以上
- [ ] E2E 測試覆蓋完整的填寫至提交成功感謝頁的流程
- [ ] 執行 `npm run type-check` 零錯誤
- [ ] 產出對應的 `docs/sop/survey-satisfaction-SOP.md` 文件 (強制規則 4)
- [ ] 完成後更新 `CHANGELOG.md` 與 `README.md` (強制規則 9)
- [ ] 所有變更透過 Git commit 並 push 至 GitHub
