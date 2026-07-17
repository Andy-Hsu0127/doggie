# Part 2 — 程式碼規範、設計模式與命名規則

## 2.1 檔案行數限制（強制）

**每個檔案不得超過 100 行（含空白行與注釋）。**

超過時的處理方式：
- 將業務邏輯抽取至 `services/` 層
- 將 UI 子元件拆分為獨立元件檔案
- 將常數移至 `constants/`
- 將型別移至 `types/`

```
✅ 正確：一個元件只做一件事，100 行以內
❌ 錯誤：一個元件包含 UI、API 呼叫、資料轉換，超過 100 行
```

---

## 2.2 設計模式（強制採用）

### 單一職責原則（SRP）
每個檔案、函式、元件只負責一件事。

```
API Route      → 只處理 HTTP 請求/回應，不含業務邏輯
Service        → 只含業務邏輯，不含 HTTP 或 UI
Component      → 只含 UI 渲染，不含 API 呼叫
```

### 三層架構（強制）
```
API Route (src/app/api/)
    ↓ 呼叫
Service Layer (src/services/)
    ↓ 呼叫
Prisma ORM (src/lib/db.ts)
```

### React 元件模式
- 優先使用 **Function Components + React Hooks**
- 複雜狀態使用 **Context API**（不引入 Redux 等外部狀態庫）
- 資料獲取使用 **Next.js Server Components**（減少客戶端 JS）

---

## 2.3 命名規範（全專案統一）

### 檔案命名
| 類型 | 規則 | 範例 |
|------|------|------|
| 頁面元件 | `kebab-case` | `survey-form.tsx` |
| 可複用元件 | `PascalCase.tsx` | `StarRating.tsx` |
| Service 檔案 | `kebab-case.service.ts` | `survey.service.ts` |
| 型別定義 | `kebab-case.types.ts` | `survey.types.ts` |
| 工具函式 | `kebab-case.ts` | `format-date.ts` |
| 測試檔案 | `*.test.ts` / `*.spec.ts` | `survey.service.test.ts` |
| API 路由目錄 | `kebab-case` | `survey-results/route.ts` |

### 程式碼內命名
| 類型 | 規則 | 範例 |
|------|------|------|
| React 元件（函式） | `PascalCase` | `SurveyForm`, `NpsSlider` |
| 一般函式 | `camelCase` | `getSurveyById`, `formatNpsScore` |
| 布林值變數 | `is` / `has` / `can` 前綴 | `isLoading`, `hasConsented` |
| 常數（模組級） | `SCREAMING_SNAKE_CASE` | `MAX_NPS_SCORE`, `JWT_EXPIRES` |
| TypeScript Interface | `PascalCase` + `Props`/`Data` 後綴 | `SurveyFormProps`, `SurveyData` |
| TypeScript Type | `PascalCase` | `DogSize`, `UserRole` |
| Prisma Model | `PascalCase`（Prisma 慣例） | `Client`, `Dog`, `SurveySatisfaction` |
| CSS 類別 | Tailwind utilities only，不自訂 class | `className="flex items-center"` |
| URL / API Route | `kebab-case` | `/api/survey-satisfaction` |
| 環境變數 | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

### 禁止命名方式
```typescript
// ❌ 禁止：無意義命名
const data = await fetch(...)
const x = calculateNps(...)
function handler(req, res) { ... }

// ✅ 正確：語意清晰
const surveyResults = await fetchSurveyResults()
const npsScore = calculateNps(responses)
async function submitSurveyHandler(req: Request): Promise<Response> { ... }
```

---

## 2.4 TypeScript 規範

**必須使用 TypeScript，禁止使用 `any` 型別。**

```typescript
// ❌ 禁止
const response: any = await fetchSurveys()

// ✅ 正確
const response: SurveyData[] = await fetchSurveys()
```

**所有 API 回應必須有統一的型別：**
```typescript
// src/types/api.types.ts
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

---

## 2.5 注釋規範

```typescript
// ✅ 說明「為什麼」，不說明「做什麼」（程式碼本身說明做什麼）
// 個資法要求：必須在提交前確認同意狀態
if (!hasConsented) throw new Error('CONSENT_REQUIRED')

// ✅ 複雜業務邏輯必須有 JSDoc
/**
 * 計算 NPS（淨推薦值）
 * NPS = 推薦者% - 批評者%
 * 推薦者：9–10 分，批評者：0–6 分
 */
export function calculateNps(scores: number[]): number { ... }

// ❌ 禁止：解釋顯而易見的程式碼
// 將 score 加 1
const newScore = score + 1
```
