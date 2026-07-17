# Part 7 — 資訊安全規範

## 7.1 資安威脅清單（本專案適用）

| 威脅類型 | 說明 | 嚴重程度 |
|---------|------|---------|
| **SQL Injection** | 惡意 SQL 注入資料庫 | 🔴 極高 |
| **XSS（跨站腳本）** | 注入惡意 JS 腳本 | 🔴 極高 |
| **CSRF（跨站請求偽造）** | 偽造用戶請求 | 🔴 高 |
| **暴力破解登入** | 反覆嘗試密碼 | 🔴 高 |
| **JWT Token 竊取** | Token 被攔截後冒用身份 | 🔴 高 |
| **個資外洩** | 飼主資料未加密或誤曝露 | 🔴 高（法律責任）|
| **敏感資訊誤入版控** | .env 或密碼被 push 到 GitHub | 🔴 高 |
| **依賴套件漏洞** | 使用有已知漏洞的 npm 套件 | 🟡 中 |
| **路徑遍歷攻擊** | 透過 API 讀取伺服器上任意檔案 | 🟡 中 |

---

## 7.2 認證安全（Authentication）

### JWT 儲存位置（強制）
```
❌ 禁止：localStorage / sessionStorage
   → XSS 攻擊可直接讀取 Token

✅ 正確：HttpOnly Cookie
   → JS 無法存取，有效防禦 XSS
```

**Next.js 中設定 HttpOnly Cookie：**
```typescript
// src/app/api/auth/login/route.ts
response.cookies.set('token', jwtToken, {
  httpOnly: true,      // JS 無法存取
  secure: true,        // 僅 HTTPS 傳送（生產環境）
  sameSite: 'strict',  // 防止 CSRF
  maxAge: 60 * 60 * 24 * 7, // 7 天
  path: '/',
})
```

### 密碼雜湊（強制）
```typescript
// 絕對禁止明文儲存密碼
// ❌ 禁止
await db.user.create({ data: { password: plainPassword } })

// ✅ 正確：bcrypt 雜湊，cost factor ≥ 12
import bcrypt from 'bcryptjs'
const hashedPassword = await bcrypt.hash(plainPassword, 12)
```

---

## 7.3 輸入驗證與防注入（強制）

### Server-Side 驗證（必須）
**使用 Zod 進行所有 API 輸入驗證：**

```typescript
// src/app/api/survey/satisfaction/route.ts
import { z } from 'zod'

const SurveySchema = z.object({
  ratingOverall: z.number().int().min(1).max(5),
  ratingStaff:   z.number().int().min(1).max(5),
  dogCondition:  z.enum(['great', 'normal', 'concern']),
  npsScore:      z.number().int().min(0).max(10),
  feedback:      z.string().max(1000).optional(),
  hasConsented:  z.literal(true), // 必須同意才能提交
})

// 在 handler 中驗證
const parsed = SurveySchema.safeParse(body)
if (!parsed.success) {
  return ApiError('VALIDATE_INVALID_FORMAT', parsed.error.message)
}
```

> **規則**：所有 API 輸入都必須通過 Zod Schema 驗證，Prisma 的型別安全不能取代此步驟。

### 防 SQL Injection（Prisma 自動處理）
Prisma ORM 預設使用 Parameterized Queries，可有效防止 SQL Injection。

```typescript
// ✅ 安全：Prisma 自動 Parameterize
await db.survey.findMany({ where: { clientName: userInput } })

// ❌ 禁止：絕對不使用 $queryRawUnsafe
await db.$queryRawUnsafe(`SELECT * WHERE name = '${userInput}'`)
```

---

## 7.4 HTTP 安全標頭（Next.js Config）

**位置：`next.config.js`**（第一次設定時建立）

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },        // 防止 Clickjacking
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
    ].join('; ')
  },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

---

## 7.5 速率限制（Rate Limiting，防暴力破解）

**使用 `upstash/ratelimit` 或自訂 middleware：**

```typescript
// src/middleware.ts（Next.js Middleware）
// 登入 API：每個 IP 每分鐘最多 5 次
// 問卷提交：每個 IP 每小時最多 20 次

const rateLimits = {
  '/api/auth/login':              { requests: 5,  window: '1m' },
  '/api/survey/satisfaction':     { requests: 20, window: '1h' },
  '/api/admin':                   { requests: 100, window: '1m' },
}
```

---

## 7.6 CORS 設定

```typescript
// next.config.js 中設定
// Phase 1（本地）：只允許 localhost
// Phase 3（上線）：只允許正式網域

const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL,
]
```

---

## 7.7 個人資料安全（個資法合規）

| 要求 | 實作方式 |
|------|---------|
| 同意告知 | 問卷首頁強制勾選 checkbox |
| 蒐集目的說明 | checkbox 旁顯示清楚的告知文字 |
| 資料保存期限 | 後台設定「自動刪除 X 年以上的資料」 |
| 刪除權（被遺忘權）| 後台提供「刪除指定飼主所有資料」功能 |
| 資料最小化 | 只收集必要欄位，禁止過度蒐集 |
| 傳輸加密 | 生產環境強制 HTTPS |

**同意聲明文字範本（問卷 checkbox 旁）：**
```
我已閱讀並同意，本次填寫的資料（包含聯絡資訊與寵物資訊）
將由「[品牌名稱]」依《個人資料保護法》進行蒐集與處理，
用於服務品質改善與市場調查。您可隨時要求查閱、更正或刪除您的資料。
```

---

## 7.8 版控安全（GitHub）

**永遠不進版控的檔案（.gitignore 已設定）：**
```
.env
.env.local
*.db
logs/
```

**上線前必須確認：**
```bash
# 確認沒有任何敏感資訊被 commit
git log --all --full-history -- "*.env"
git grep -r "password\|secret\|token" --include="*.ts" src/
```

---

## 7.9 套件漏洞掃描（定期執行）

```bash
# 掃描已知漏洞
npm audit

# 自動修復低風險漏洞
npm audit fix

# 每月至少執行一次，高嚴重性漏洞必須立即修補
```

---

## 7.10 資安 Checklist（每個功能上線前必過）

- [ ] 所有 API 輸入都有 Zod 驗證
- [ ] Admin API 都有 JWT + RBAC 驗證
- [ ] 沒有使用 `$queryRawUnsafe`
- [ ] JWT 存在 HttpOnly Cookie，非 localStorage
- [ ] 密碼用 bcrypt cost ≥ 12 雜湊
- [ ] 涉及個資的 API 有同意記錄驗證
- [ ] `npm audit` 無高嚴重性漏洞
- [ ] `.env` 未進版控（`git status` 確認）
- [ ] HTTP 安全標頭已設定
- [ ] Rate Limiting 已設定（登入、問卷提交）
