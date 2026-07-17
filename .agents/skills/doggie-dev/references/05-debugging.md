# Part 5 — 快速 Debug 方法

## 5.1 Debug 工具清單

| 工具 | 用途 | 啟動方式 |
|------|------|---------|
| **Next.js 內建 Dev Mode** | 熱更新 + 詳細錯誤訊息 | `npm run dev` |
| **Prisma Studio** | 直接查看/編輯資料庫內容 | `npx prisma studio` |
| **VS Code Debugger** | 打斷點、逐步執行 Server 程式碼 | 見 5.2 |
| **React DevTools** | 查看元件樹、Props、State | Chrome 擴充功能 |
| **pino-pretty** | 美化 JSON 日誌輸出，開發時使用 | 自動（已在 logger.ts 設定）|
| **TypeScript 檢查** | 立即找出型別錯誤 | `npm run type-check` |

---

## 5.2 VS Code Debugger 設定

**位置：`.vscode/launch.json`（第一次 setup 時建立）**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

使用方式：
1. 在 VS Code 的 Server 程式碼行號左側點擊設置斷點
2. 按 `F5` 啟動 Debug 模式
3. 觸發對應的 API 請求後，程式會暫停在斷點

---

## 5.3 快速 Debug 步驟（標準流程）

**遇到問題時，依序執行以下步驟：**

### Step 1：確認問題層次
```
UI 錯誤？       → React DevTools + 瀏覽器 Console
API 錯誤？      → 瀏覽器 Network Tab（看 HTTP 狀態碼與回應 body）
業務邏輯錯誤？  → Logger 輸出 + VS Code Debugger
資料庫問題？    → Prisma Studio + error.log
```

### Step 2：查看 Logger 輸出
```bash
# 開發環境：直接看 terminal 的 pino-pretty 輸出
# 搜尋特定模組的錯誤：
npm run dev 2>&1 | grep '"level":50'    # 只看 ERROR 層級
npm run dev 2>&1 | grep "survey"        # 只看 survey 相關
```

### Step 3：Prisma Studio 確認資料
```bash
npx prisma studio
# 開啟 http://localhost:5555
# 直接查看資料表內容，確認資料是否正確寫入
```

### Step 4：API 端點直接測試
使用 VS Code 的 **Thunder Client** 擴充功能直接打 API：
```
POST http://localhost:3000/api/survey/satisfaction
Content-Type: application/json

{
  "ratingOverall": 5,
  "ratingStaff": 4,
  "dogCondition": "great",
  "npsScore": 9,
  "hasConsented": true
}
```

---

## 5.4 常見錯誤快速查詢

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `PrismaClientInitializationError` | 資料庫未初始化或路徑錯誤 | `npx prisma migrate dev` |
| `Cannot find module` | 路徑別名未設定 | 檢查 `tsconfig.json` 的 `paths` |
| `Hydration failed` | Server/Client 渲染結果不一致 | 確認 `use client` 指令位置 |
| `JWT malformed` | Token 格式錯誤 | 清除瀏覽器 localStorage 重新登入 |
| `NEXT_PUBLIC_` 環境變數為 undefined | 前端變數未加 NEXT_PUBLIC 前綴 | 重命名變數並重啟 `npm run dev` |

---

## 5.5 Debug 日誌快速加入（臨時，記得移除）

```typescript
// 臨時 debug 日誌（開發結束後必須移除）
// 在行尾加上 // TODO: remove debug
log.debug({ input, result }, 'DEBUG CHECKPOINT') // TODO: remove debug
```

**約定**：臨時 debug 程式碼一律加 `// TODO: remove debug` 注釋，
方便用全域搜尋 `TODO: remove debug` 快速找到並清除。
