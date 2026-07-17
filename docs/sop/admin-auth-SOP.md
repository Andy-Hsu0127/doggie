# SOP：管理員登入與 JWT 認證系統 (admin-auth-SOP)

**版本**：v1.0
**建立日期**：2026-07-17
**負責人**：Antigravity (AI Developer)

---

## 功能說明
提供安全的管理後台登入頁面與 JWT 憑證管理。管理員登入後簽發 `HttpOnly` Cookie，並使用 Next.js Middleware 進行路由保護。

---

## 系統流程圖
```
管理員 → 瀏覽器開啟 /login → 輸入信箱/密碼 → 提交
                                    ↓
                       POST /api/auth/login
                                    ↓
                       AuthService.verifyUser()
                                    ↓
                       驗證成功 → 簽發 JWT Token
                                    ↓
                       設定 HttpOnly Cookie (token)
                                    ↓
                       回應 200 OK → 導向 /admin/dashboard

[全域防護] 
任何進入 /admin/:path* 的請求 → Middleware 攔截 
  - 無 token 或已過期：自動導向 /login 並清除 Cookie
  - 有效 token：NextResponse.next() 放行
```

---

## 相關檔案
| 檔案路徑 | 說明 |
|------|------|
| `prisma/seed.ts` | 建立預設管理員 Seed 指令 |
| `src/middleware.ts` | Next.js 全域路由攔截與 JWT 驗證 |
| `src/lib/auth.ts` | JWT 簽發與驗證工具（`jsonwebtoken`） |
| `src/types/auth.types.ts` | Zod 驗證架構與型別 |
| `src/services/auth.service.ts` | 密碼 bcrypt 驗證與資料庫操作 |
| `src/app/api/auth/login/route.ts` | 登入 API 端點，設定 HttpOnly Cookie |
| `src/app/api/auth/logout/route.ts` | 登出 API 端點，清除 Cookie |
| `src/app/(admin)/login/page.tsx` | 管理員登入 UI 頁面 |

---

## 預設測試帳號
資料庫初始種子資料已內建管理員帳號：
- **登入帳號**：`admin@doggie.com`
- **登入密碼**：`admin123`

---

## 常見問題與除錯 (Debug)
1. **JWT Token 被 JavaScript 竊取？**
   - 本系統強制將 token 存在 `HttpOnly` Cookie，前端 `document.cookie` 無法讀取，有效防禦 XSS 攻擊。
2. **在 Middleware 發生 Node.js Crypto 模組錯誤？**
   - 由於 Next.js Middleware 執行於 Edge Runtime，本系統使用純 JavaScript 解碼函式 (`atob`) 進行驗證，不依賴 Node.js 原生 crypto，100% 邊緣運算安全。
