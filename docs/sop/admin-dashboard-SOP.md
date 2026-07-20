# SOP：管理後台儀表板系統 (admin-dashboard-SOP)

**版本**：v1.0
**建立日期**：2026-07-20
**負責人**：Antigravity (AI Developer)

---

## 功能說明
提供管理員視覺化的後台滿意度與 NPS 分析系統。

---

## 系統流程圖
```
管理員 (瀏覽器已登入) → 開啟 /admin/dashboard
                                  ↓
                 Promise.all 載入 API 數據
                 - GET /api/admin/stats
                 - GET /api/admin/responses
                                  ↓
                 API 驗證 JWT Cookie 角色 (RBAC)
                                  ↓
                 資料庫讀取 & 記憶體數據分組聚合
                                  ↓
                 渲染 KPI 卡片、SVG 折線/條形圖、
                 低分紅色警示 (NPS ≤ 6)、詳細數據表格
```

---

## 相關檔案
| 檔案路徑 | 說明 |
|------|------|
| `src/lib/auth-helpers.ts` | API 端點身份/角色驗證輔助函式 |
| `src/services/survey.service.ts` | 聚合滿意度統計、NPS 算分、週趨勢邏輯 |
| `src/app/api/admin/stats/route.ts` | 統計 API 端點（驗證權限） |
| `src/app/api/admin/responses/route.ts` | 詳細歷史問卷 API 端點（驗證權限） |
| `src/app/admin/layout.tsx` | 後台主版面 Layout (含安全登出按鈕) |
| `src/app/admin/dashboard/page.tsx` | 儀表板主要頁面邏輯 |
| `src/components/admin/StatsCards.tsx` | KPI 卡片元件 |
| `src/components/admin/ChartsSection.tsx` | 趨勢與分佈圖表元件 (純 SVG 渲染) |
| `src/components/admin/AlertList.tsx` | ⚠️ 低分警示紅色區塊元件 (NPS ≤ 6) |
| `src/components/admin/ResponseTable.tsx` | 歷程明細表格元件 (含模糊搜尋) |

---

## 數據統計規則
1. **NPS 分數**：`((推薦者數量 - 批評者數量) / 總填寫數) * 100`。
   - 推薦者：NPS score 為 9 或 10
   - 批評者：NPS score 為 0 至 6
2. **週趨勢分組 (Weekly Trends)**：
   - 依據 `submittedAt` 以 ISO 標準週分組，限顯示最新 8 週的 NPS 與評分趨勢。
3. **低分警示**：
   - 篩選 NPS score ≤ 6 的數據顯示於顯眼的紅色區域，以便管理者快速追蹤客訴。
