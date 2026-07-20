# SOP：後台 CSV 資料匯出功能與啟動腳本 (csv-export-SOP)

**版本**：v1.0
**建立日期**：2026-07-20
**負責人**：Antigravity (AI Developer)

---

## 功能說明
提供管理員一鍵匯出問卷紀錄 CSV 報表，以及雙擊自動在背景啟動服務的 Windows 批次檔。

---

## 相關檔案
| 檔案路徑 | 說明 |
|------|------|
| `start.bat` | 根目錄快捷啟動腳本（自動檢查/跑 Seed/啟動服務並開網頁） |
| `src/app/api/admin/export/route.ts` | 匯出 API 端點，支援 UTF-8 BOM 與 JWT 權限校對 |
| `src/components/admin/ResponseTable.tsx` | 新增「匯出 CSV 📥」按鈕之列表元件 |

---

## 1. 快捷啟動腳本 (`start.bat`) 使用說明
- **執行方式**：雙擊根目錄下的 `start.bat` 檔案即可。
- **後台背景運行**：腳本會拉起最小化的 CMD 視窗執行 `npm run dev`，關閉該最小化視窗即可停止服務。
- **防呆機制**：腳本會自動檢驗 `node_modules` 與資料庫是否存在，若不存在會自動執行 `npm install`、`npx prisma migrate dev` 與 `npx prisma db seed`，確保環境無損。

---

## 2. CSV 匯出功能使用說明
- **位置**：登入後台後，於「所有問卷填寫紀錄」表格右上方有「**匯出 CSV 📥**」按鈕。
- **相容性**：檔案最前端已寫入 `UTF-8 BOM` (`\ufeff`)，下載後使用 Microsoft Excel 直接開啟中文絕無亂碼。
- **欄位格式**：包含 `ID, 提交時間, 接送場次, 整體滿意度, 人員與司機滿意度, 狗狗狀況, NPS推薦分數, 回饋建議`。
- **安全防護**：非 `SUPER_ADMIN` 或 `ANALYST` 角色嘗試請求 `/api/admin/export` 會直接遭到拒絕並回傳 `401`。
