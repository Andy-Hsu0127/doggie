# Part 3 — 錯誤處理與日誌系統

## 3.1 日誌工具（Logger）

使用 **`pino`**（Node.js 最高效的結構化日誌庫）。
日誌格式為 **JSON 結構化輸出**，方便未來接入雲端日誌服務（如 Datadog、AWS CloudWatch）。

**設定檔位置：`src/lib/logger.ts`（不超過 30 行）**

```typescript
// src/lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})

// 子 logger 帶模組名稱，方便篩選
export const createLogger = (module: string) =>
  logger.child({ module })
```

---

## 3.2 日誌層級規範

| 層級 | 使用時機 | 範例 |
|------|---------|------|
| `DEBUG` | 開發期詳細追蹤 | 函式進入、SQL 查詢結果 |
| `INFO` | 正常業務事件 | 問卷提交成功、用戶登入 |
| `WARN` | 非預期但不影響運作 | 回應時間過慢、重試請求 |
| `ERROR` | 需要處理的錯誤 | API 呼叫失敗、驗證失敗 |
| `FATAL` | 系統無法繼續運作 | 資料庫連線中斷 |

```typescript
// 正確使用範例
const log = createLogger('survey.service')

log.info({ surveyId: id, clientId }, 'Survey submitted successfully')
log.error({ error: err.message, surveyId: id }, 'Failed to save survey')
log.warn({ responseTimeMs: 3200 }, 'Slow API response detected')
```

---

## 3.3 統一錯誤代碼系統

**位置：`src/constants/errors.ts`**

```typescript
export const ERROR_CODES = {
  // 認證錯誤 (AUTH_)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED:       'AUTH_002',
  AUTH_INSUFFICIENT_ROLE:   'AUTH_003',

  // 問卷錯誤 (SURVEY_)
  SURVEY_CONSENT_REQUIRED:  'SURVEY_001',
  SURVEY_INVALID_NPS:       'SURVEY_002',
  SURVEY_DUPLICATE_SUBMIT:  'SURVEY_003',

  // 資料庫錯誤 (DB_)
  DB_NOT_FOUND:             'DB_001',
  DB_CONNECTION_FAILED:     'DB_002',
  DB_UNIQUE_CONSTRAINT:     'DB_003',

  // 驗證錯誤 (VALIDATE_)
  VALIDATE_MISSING_FIELD:   'VALIDATE_001',
  VALIDATE_INVALID_FORMAT:  'VALIDATE_002',
} as const
```

---

## 3.4 統一 API 錯誤回應格式

**所有 API 錯誤都必須使用此格式：**

```typescript
// src/types/api.types.ts 中定義
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string      // 來自 ERROR_CODES
    message: string   // 使用者可見訊息（繁體中文）
    detail?: string   // 開發者詳細訊息（僅 development 環境回傳）
  }
}

// 錯誤回應範例
// { success: false, error: { code: "AUTH_003", message: "權限不足，請聯絡管理員" } }
```

---

## 3.5 Error Log 檔案輸出（生產環境）

```bash
# 生產環境日誌寫入檔案
logs/
├── app.log       ← INFO 以上所有日誌
├── error.log     ← ERROR 以上的錯誤日誌
└── access.log    ← HTTP 請求日誌
```

日誌保留策略：
- 開發環境：Console 輸出，不寫檔
- 生產環境：每日 rotate，保留 30 天
- `logs/` 目錄加入 `.gitignore`

---

## 3.6 React 錯誤邊界（Frontend）

每個主要頁面區塊必須包覆 **Error Boundary**：

```typescript
// src/components/shared/ErrorBoundary.tsx
// 當子元件發生未處理的 JS 錯誤時，顯示友善的錯誤畫面
// 同時向後端 /api/log/client-error 回報錯誤（不暴露堆疊給用戶）
```
