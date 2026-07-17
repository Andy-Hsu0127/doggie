'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      if (result.success) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setErrorMsg(result.error?.message || '登入失敗，請檢查輸入')
      }
    } catch {
      setErrorMsg('連線失敗，請檢查網路連線')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-amber-100 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-amber-900">管理員系統登入</h1>
          <p className="text-xs text-amber-700">請輸入管理帳號以進入狗狗照護後台</p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs text-red-700 bg-red-100 rounded-lg flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-amber-900">電子信箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@doggie.com"
                className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm bg-white/50"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-amber-900">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm bg-white/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm disabled:opacity-75 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '正在驗證身分...' : '安全登入 🔑'}
          </button>
        </form>
      </div>
    </main>
  )
}
