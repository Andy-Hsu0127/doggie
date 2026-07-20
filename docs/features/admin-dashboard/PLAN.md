# Feature Plan：管理後台儀表板系統 (admin-dashboard)

## 功能描述
建立管理員後台儀表板，提供滿意度數據統計與視覺化分析。包含四大滿意度 KPI 卡片（NPS 分數、平均星評等）、週趨勢折線圖、狗狗精神狀態分佈圖、低分警示區（NPS ≤ 6）、詳細問卷列表，以及安全的登出按鈕。

## 所屬 Phase
Phase 1 (滿意度調查與基礎建設)

## 影響的檔案清單

### 新增檔案
- **後台業務 API**：
  - `src/app/api/admin/stats/route.ts` (獲取滿意度統計與圖表數據，僅限管理員)
  - `src/app/api/admin/responses/route.ts` (獲取分頁問卷詳細列表，僅限管理員)
- **後台 UI 元件 (模組化設計以符合 100 行限制)**：
  - `src/app/admin/layout.tsx` (後台主版面，含側邊欄、導覽列與登出按鈕)
  - `src/app/admin/dashboard/page.tsx` (儀表板主頁面)
  - `src/components/admin/StatsCards.tsx` (KPI 指標數據卡片元件)
  - `src/components/admin/ChartsSection.tsx` (NPS 趨勢與狗狗狀況圖表元件，採用 HTML5 Canvas/SVG 元件，避免大型 Chart 庫超出限制)
  - `src/components/admin/AlertList.tsx` (低分 NPS ≤ 6 紅色警告回饋列表)
  - `src/components/admin/ResponseTable.tsx` (分頁問卷詳細表格元件)

### 修改檔案
- `CHANGELOG.md` (新增 v0.6.0 開發中記錄)
- `progress_tracker.csv` (更新 P1-010 & P1-011 狀態)

---

## API 設計

### 1. 後台數據統計 API (GET `/api/admin/stats`)
* **權限**：超級管理員 (`SUPER_ADMIN`) / 分析師 (`ANALYST`)
* **回應 Body (JSON)**:
  ```json
  {
    "success": true,
    "data": {
      "totalCount": 42,
      "npsScore": 75,
      "avgOverall": 4.7,
      "avgStaff": 4.8,
      "dogConditions": {
        "GREAT": 30,
        "NORMAL": 10,
        "CONCERN": 2
      },
      "weeklyTrends": [
        { "week": "W27", "nps": 70, "avgRating": 4.5 },
        { "week": "W28", "nps": 75, "avgRating": 4.7 }
      ]
    }
  }
  ```

### 2. 詳細問卷列表 API (GET `/api/admin/responses`)
* **權限**：超級管理員 (`SUPER_ADMIN`) / 分析師 (`ANALYST`)
* **回應 Body (JSON)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "sessionLabel": "2026-07-20",
        "ratingOverall": 5,
        "ratingStaff": 5,
        "dogCondition": "GREAT",
        "npsScore": 10,
        "feedback": "非常棒的接送服務！",
        "submittedAt": "2026-07-20T09:00:00.000Z"
      }
    ]
  }
  ```

---

## 🔒 後端 API 權限防禦 (符合 Part 7 規範)
除了 `middleware.ts` 防護前端路由外，後端 API 端點將直接解析並驗證 Cookie 中的 JWT Token，確認 `role` 為 `SUPER_ADMIN` 或 `ANALYST`，否則回傳 `401 Unauthorized` 或 `403 Forbidden`，防止透過 API 繞過前端越權訪問。

---

## 驗證標準 (Definition of Done)
- [x] 遵守動工前強制閱讀清單 (Step 0A/0B/0C)
- [ ] 所有 API 輸入與權限驗證符合 Zod 與 RBAC 規範 (強制規則 5, 6)
- [ ] 限制單一檔案不得超過 100 行 (強制規則 2)
- [ ] NPS ≤ 6 的意見回饋有正確顯示於「低分紅色警示區」(驗證計畫 3)
- [ ] 點擊「登出」按鈕能正確清除 Cookie 並導回 `/login`
- [ ] 產出對應的 `docs/sop/admin-dashboard-SOP.md` 文件 (強制規則 4)
- [ ] 完成後更新 `CHANGELOG.md` 與 `progress_tracker.csv`
- [ ] 所有變更透過 Git commit 並 push 至 GitHub
