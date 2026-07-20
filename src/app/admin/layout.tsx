'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      alert('登出失敗，請檢查網路連線')
    }
  }

  return (
    <div className="min-h-screen bg-amber-50/20 flex flex-col">
      <header className="bg-white border-b border-amber-100/80 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500 fill-orange-100" />
          <span className="text-sm font-bold text-amber-900">
            毛孩照護後台管理系統
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-semibold text-amber-800 hover:text-orange-600 bg-amber-50 hover:bg-amber-100/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>安全登出</span>
        </button>
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}
