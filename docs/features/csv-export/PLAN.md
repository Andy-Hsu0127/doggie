# Feature Plan：後台 CSV 資料匯出功能 (csv-export)

## 功能描述
提供管理員一鍵下載完整問卷資料的 CSV 檔案。後端將查詢所有歷史問卷，格式化為 CSV 欄位（包含提交時間、接送場次、滿意度星評、NPS、狗狗精神狀況與具體意見），並在檔案最前段寫入 `UTF-8 BOM`（`\ufeff`），確保管理員下載後在 Excel 中直接開啟絕無中文亂碼。

## 所屬 Phase
Phase 1 (滿意度調查與基礎建設)

## 影響的檔案清單

### 新增檔案
- **後台匯出 API**：
  - `src/app/api/admin/export/route.ts` (產生並下載滿意度問卷 CSV，僅限管理員)
- **快捷啟動腳本**：
  - `start.bat` (雙擊即可自動檢查環境、跑 Seed、在背景/最小化啟動 Next.js 伺服器並自動開啟網頁)

### 修改檔案
- `src/components/admin/ResponseTable.tsx` (在表格標頭新增「匯出 CSV 報表 📥」按鈕)
- `CHANGELOG.md` (新增 v0.7.0 開發中記錄)
- `progress_tracker.csv` (更新 P1-012 狀態)

---

## API 設計

### 1. CSV 匯出 API (GET `/api/admin/export`)
* **權限**：超級管理員 (`SUPER_ADMIN`) / 分析師 (`ANALYST`)
* **回應 Header**:
  - `Content-Type`: `text/csv; charset=utf-8`
  - `Content-Disposition`: `attachment; filename=survey_satisfaction_export_<date>.csv`
* **回應 Body (CSV 內容)**:
  - 檔案開頭附帶 `\ufeff` (BOM)。
  - 欄位格式：`ID,提交時間,接送場次,整體滿意度,人員與司機滿意度,狗狗狀況,NPS推薦分數,回饋建議`

---

## 🔒 權限安全防禦 (符合 Part 7 規範)
匯出 API 端點將比照後台 API，直接解析並驗證 Cookie 中的 JWT Token，確認 `role` 為 `SUPER_ADMIN` 或 `ANALYST`，否則回傳 `401 Unauthorized`，嚴格防止敏感個資遭越權下載。

---

## 驗證標準 (Definition of Done)
- [x] 遵守動工前強制閱讀清單 (Step 0A/0B/0C)
- [ ] 匯出之 CSV 檔案具備 `UTF-8 BOM` 且用 Excel 開啟無亂碼
- [ ] 非管理員身分（無 valid token）嘗試 GET `/api/admin/export` 回傳 `401`
- [ ] 點擊前端 Table 的「匯出 CSV 報表」按鈕可順利觸發瀏覽器下載
- [ ] 限制單一檔案不得超過 100 行 (強制規則 2)
- [ ] 產出對應的 `docs/sop/csv-export-SOP.md` 文件 (強制規則 4)
- [ ] 完成後更新 `CHANGELOG.md` 與 `progress_tracker.csv`
- [ ] 所有變更透過 Git commit 並 push 至 GitHub
