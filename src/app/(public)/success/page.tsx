import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-amber-100 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-10 h-10 fill-current text-white stroke-emerald-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-amber-900">問卷提交成功！</h1>
          <p className="text-sm text-amber-800 leading-relaxed">
            非常感謝您的珍貴回饋！您的回饋是我們精進服務的最大動力，我們將以此作為未來規劃實體場地的關鍵指標。
          </p>
        </div>
        <div className="w-full border-t border-amber-100 pt-6">
          <span className="text-xs text-amber-600">
            您現在可以關閉此網頁，祝您與寶貝有美好的一天！🐾
          </span>
        </div>
      </div>
    </main>
  )
}
