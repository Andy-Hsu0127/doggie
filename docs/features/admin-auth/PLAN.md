# Feature Plan：管理員登入與 JWT 認證系統 (admin-auth)

## 功能描述
建立安全的管理後台登入機制。管理員可於 `/login` 頁面輸入信箱與密碼，系統驗證成功後簽發 JWT，並將其安全儲存於 `HttpOnly` Cookie 中（防止 XSS 與 CSRF 攻擊）。使用 Next.js Middleware 對後台路由 `/admin` 進行攔截防護，未授權者自動導向回登入頁。

## 所屬 Phase
Phase 1 (滿意度調查與基礎建設)

## 影響的檔案清單

### 新增檔案
- **認證業務邏輯與 API**：
  - `src/lib/auth.ts` (JWT 簽發與驗證工具函式，整合 `jsonwebtoken`)
  - `src/types/auth.types.ts` (登入 Zod Schema 與 TypeScript 型別)
  - `src/services/auth.service.ts` (密碼雜湊驗證、初始帳號 Seed 邏輯)
  - `src/app/api/auth/login/route.ts` (登入 API，簽發 HttpOnly Cookie)
  - `src/app/api/auth/logout/route.ts` (登出 API，清除 HttpOnly Cookie)
  - `src/middleware.ts` (Next.js 全域路由防護中介層，攔截 `/admin/:path*` 請求)
- **登入前端頁面**：
  - `src/app/(admin)/login/page.tsx` (管理員登入頁面)
- **測試檔案**：
  - `tests/unit/services/auth.service.test.ts` (AuthService 單元測試)

### 修改檔案
- `prisma/seed.ts` (建立初始超級管理員帳號)
- `package.json` (若有新增指令)
- `CHANGELOG.md` (新增 v0.5.0 開發中記錄)
- `progress_tracker.csv` (更新 P1-009 狀態)

---

## API 設計

### 1. 登入 API (POST `/api/auth/login`)
* **權限**：公開 (Public)
* **請求 Body 格式**:
  ```json
  {
    "email": "admin@doggie.com",
    "password": "secure_password_123"
  }
  ```
* **回應格式 (Cookie)**:
  - 會於 Header 設定 `Set-Cookie: token=jwt_string; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
* **回應 Body (JSON)**:
  - 成功 (200 OK):
    ```json
    {
      "success": true,
      "data": {
        "name": "管理員",
        "email": "admin@doggie.com",
        "role": "SUPER_ADMIN"
      }
    }
    ```
  - 失敗 (401 Unauthorized - 密碼錯誤):
    ```json
    {
      "success": false,
      "error": {
        "code": "AUTH_INVALID_CREDENTIALS",
        "message": "帳號或密碼輸入錯誤"
      }
    }
    ```

### 2. 登出 API (POST `/api/auth/logout`)
* **權限**：公開 (Public)
* **回應格式 (Cookie)**:
  - 設定 `Set-Cookie: token=; HttpOnly; Path=/; Max-Age=0` (清除 Token)
* **回應 Body (JSON)**:
  ```json
  {
    "success": true
  }
  ```

---

## 🔒 資安防護實作 (符合 Part 7 規範)
1. **防禦 XSS**：JWT 絕不存於 `localStorage`，強制使用 `HttpOnly` Cookie，前端 JS 無法讀取。
2. **防禦 CSRF**：Cookie 設定 `SameSite=Strict`，限制跨站請求攜帶憑證。
3. **安全傳輸**：生產環境強制設定 `Secure=true`（僅限 HTTPS 傳送）。
4. **防密碼洩漏**：資料庫密碼使用 `bcryptjs` 強力雜湊（Cost factor = 12）。
5. **API 驗證**：登入 API 使用 Zod 進行欄位格式防呆驗證。

---

## ⚖️ 未來擴充設計：二次驗證 (2FA/MFA)
為了未來能無縫升級 Google Authenticator (TOTP) 或 SMS 驗證碼等二次驗證，我們做了以下預留設計：

1. **資料庫欄位預留**：
   - 已在 `User` model 中新增 `twoFactorEnabled: Boolean`（預設為 `false`）與 `twoFactorSecret: String?`（OTP 密鑰）。
2. **API 登入流程預留**：
   - 未來當登入成功且 `twoFactorEnabled` 為 `true` 時，`/api/auth/login` **不會直接簽發 JWT**，而是會回傳 `{ success: true, requires2FA: true }`。
   - 前端隨即彈出二次驗證輸入框，將用戶導向 `/api/auth/2fa/verify`。驗證成功後才簽發 JWT HttpOnly Cookie。

---

## 驗證標準 (Definition of Done)
- [x] 遵守動工前強制閱讀清單 (Step 0A/0B/0C)
- [ ] 所有 API 輸入皆有 Zod Schema 驗證 (強制規則 6)
- [ ] JWT 存在 HttpOnly Cookie，禁止存在 localStorage (強制規則 7)
- [ ] 限制單一檔案不得超過 100 行 (強制規則 2)
- [ ] `auth.service.ts` 的單元測試覆蓋率達 90% 以上
- [ ] 通過 Part 7 的資安 Checklist
- [ ] 產出對應的 `docs/sop/admin-auth-SOP.md` 文件 (強制規則 4)
- [ ] 完成後更新 `CHANGELOG.md`、`README.md` 與 `progress_tracker.csv`
- [ ] 所有變更透過 Git commit 並 push 至 GitHub

