import React, { Suspense } from 'react'
import { SurveyForm } from '@/components/survey/SurveyForm'
import { Heart } from 'lucide-react'

export default function SurveyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-amber-100 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold text-amber-900">
            毛孩照護服務問卷
          </h1>
          <p className="text-xs text-amber-700">
            感謝您將狗狗託付給我們！請花 2
            分鐘填寫問卷，幫助我們提供更好的服務。
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-sm text-amber-800">載入問卷中...</div>
          }
        >
          <SurveyForm />
        </Suspense>
      </div>
    </main>
  )
}
