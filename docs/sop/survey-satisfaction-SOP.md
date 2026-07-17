# SOP：問卷 A 服務滿意度系統 (survey-satisfaction-SOP)

**版本**：v1.0
**建立日期**：2026-07-17
**最後更新**：2026-07-17
**負責人**：Antigravity (AI Developer)

---

## 功能說明
建立供現有客戶填寫的狗狗照顧滿意度問卷。每次接送狗狗送回飼主後，飼主可透過 LINE 點開專屬連結（例如 `/survey?session=2026-07-17`）進入問卷。

填寫指標包含：
1. 整體服務評分 (1-5 星)
2. 照顧員/司機評分 (1-5 星)
3. 狗狗精神狀況 (活蹦亂跳/健康正常/略顯疲倦)
4. NPS 推薦意願分 (0-10 分)
5. 意見與回饋
6. 同意個資保護聲明 (強制)

資料隨即儲存至 SQLite 資料庫，為後台管理與未來 CRM、市調分析奠定基礎。

---

## 系統流程圖

```
飼主 (LINE 用戶) → 點擊專屬連結 (/survey?session=2026-07-17)
                         ↓
               進入 Next.js 手機優先網頁
                         ↓
               填寫問卷 (星評/狗狗狀態/NPS/個資 checkbox)
                         ↓
                點擊「提交滿意度問卷 🐾」
                         ↓
               [POST] /api/survey/satisfaction (Zod 驗證)
                         ↓
               SurveyService.createSatisfaction()
                         ↓
               Prisma 客戶端 → 寫入 SQLite doggie.db
                         ↓
              API 回傳 { success: true }
                         ↓
               前端導向 /success (感謝頁)
```

---

## 相關檔案

| 檔案路徑 | 類型 | 說明 |
|------|------|------|
| `prisma/schema.prisma` | DB Schema | 定義 `SurveySatisfaction` 資料表結構 |
| `src/types/survey.types.ts` | 驗證/型別 | Zod 驗證架構與 TypeScript 型別定義 |
| `src/services/survey.service.ts` | 服務層 | 處理問卷寫入與後台數據分析聚合 |
| `src/app/api/survey/satisfaction/route.ts` | API 路由 | 處理問卷提交 HTTP POST 請求與防呆驗證 |
| `src/components/survey/SurveyForm.tsx` | UI 元件 | 問卷表單核心元件（手機優化） |
| `src/components/survey/StarRating.tsx` | UI 元件 | 1-5 星星評級元件 |
| `src/components/survey/NpsSlider.tsx` | UI 元件 | 0-10 NPS 推薦度滑桿與表情符號元件 |
| `src/components/survey/DogConditionSelector.tsx` | UI 元件 | 狗狗健康狀態卡片選擇元件 |
| `src/app/(public)/survey/page.tsx` | 頁面路由 | 問卷首頁入口（含 Suspense） |
| `src/app/(public)/success/page.tsx` | 頁面路由 | 提交成功感謝頁 |
| `tests/unit/services/survey.service.test.ts` | 測試 | SurveyService 單元測試（Vitest 模擬 DB） |

---

## 環境變數需求

| 變數名稱 | 說明 | 是否必填 | 開發預設值 |
|------|------|---|---|
| `DATABASE_URL` | SQLite 資料庫連線字串 | ✅ 是 | `file:./doggie.db` |
| `NEXT_PUBLIC_BASE_URL` | 全站基礎 URL | ✅ 是 | `http://localhost:3000` |

---

## 常見問題與解法

### Q1: 點擊問卷頁面出現 Hydration / Build 錯誤？
- **解法**：問卷使用了 `useSearchParams` 獲取 LINE 傳送的 `session` 參數。在 Next.js App Router 中，使用此 Hook 必須被包覆在 `<Suspense>` 邊界中。請確認 `src/app/(public)/survey/page.tsx` 中有正確使用 `<Suspense>`。

### Q2: 沒勾選個資 checkbox 卻成功提交問卷？
- **解法**：此為資安防護漏洞。請確認：
  1. 前端 `input[type="checkbox"]` 是否有加入 `required` 屬性。
  2. `src/types/survey.types.ts` 的 Zod Schema 中，`hasConsented` 欄位有使用 `z.literal(true)` 進行後端強制防守。

---

## 未來擴充與 Phase 2/3 注意事項
1. **與客戶主表 (Client) 關聯**：目前的 `clientId` 欄位為可選 (optional)。在 Phase 2 CRM 系統上線後，後台人員在發送問卷時應夾帶客戶的 `clientId`（例如 `/survey?session=2026-07-17&client_id=123`），提交後即可自動將滿意度與飼主資料綁定。
2. **LINE Bot 自動化發送**：Phase 3 可串接 LINE Messaging API，在每次接送任務完成後自動透過 LINE Bot 對飼主推送客製化問卷 URL。
