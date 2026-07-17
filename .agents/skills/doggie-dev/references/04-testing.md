# Part 4 — 測試策略

## 4.1 測試工具選型

| 測試類型 | 工具 | 說明 |
|---------|------|------|
| **單元測試** | Vitest | 與 Next.js/Vite 原生整合，速度極快 |
| **整合測試** | Vitest + Supertest | 測試 API Routes 與 Service 層交互 |
| **E2E 測試** | Playwright | 模擬真實用戶操作（問卷填寫、登入後台）|
| **型別測試** | TypeScript compiler | `tsc --noEmit` 確保無型別錯誤 |

---

## 4.2 測試覆蓋率目標

| 層次 | 目標覆蓋率 | 優先級 |
|------|-----------|--------|
| `services/` 業務邏輯層 | **≥ 90%** | 🔴 最高 |
| `app/api/` API Routes | **≥ 80%** | 🔴 最高 |
| `components/` UI 元件 | **≥ 60%** | 🟡 中 |
| `lib/` 工具函式 | **≥ 85%** | 🔴 最高 |

---

## 4.3 測試命名規範

```
tests/
├── unit/
│   ├── services/
│   │   └── survey.service.test.ts
│   └── lib/
│       └── auth.test.ts
├── integration/
│   └── api/
│       └── survey-api.test.ts
└── e2e/
    ├── survey-flow.spec.ts     ← 填寫問卷完整流程
    └── admin-login.spec.ts     ← 後台登入流程
```

---

## 4.4 測試撰寫規範

### 單元測試結構（AAA 模式）
```typescript
// survey.service.test.ts
describe('SurveyService', () => {
  describe('calculateNps', () => {
    it('should return 100 when all scores are 9 or above', () => {
      // Arrange（準備）
      const scores = [9, 10, 9, 10]

      // Act（執行）
      const result = calculateNps(scores)

      // Assert（斷言）
      expect(result).toBe(100)
    })

    it('should return -100 when all scores are 6 or below', () => {
      const scores = [0, 3, 6, 5]
      expect(calculateNps(scores)).toBe(-100)
    })
  })
})
```

### E2E 測試結構
```typescript
// e2e/survey-flow.spec.ts
test('飼主可以完整填寫問卷 A 並成功提交', async ({ page }) => {
  await page.goto('/survey')
  await page.click('[data-testid="star-rating-5"]')
  await page.click('[data-testid="staff-rating-4"]')
  await page.click('[data-testid="dog-condition-great"]')
  await page.locator('[data-testid="nps-slider"]').fill('9')
  await page.check('[data-testid="consent-checkbox"]')
  await page.click('[data-testid="submit-button"]')
  await expect(page).toHaveURL('/success')
})
```

> **規則**：所有互動元素必須有 `data-testid` 屬性，**命名格式**：`kebab-case` 描述功能。

---

## 4.5 執行指令

```bash
# 單元 + 整合測試
npm run test

# 測試並產生覆蓋率報告
npm run test:coverage

# E2E 測試（需先啟動開發伺服器）
npm run test:e2e

# 型別檢查
npm run type-check
```

---

## 4.6 新功能測試規定

**每個新功能完成後，必須：**
1. 對應的 Service 函式有 ≥ 90% 單元測試覆蓋
2. 至少一個 E2E 測試覆蓋主要用戶流程
3. `npm run type-check` 零錯誤
4. 測試全部通過才可提交
