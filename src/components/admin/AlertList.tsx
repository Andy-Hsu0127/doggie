import React from 'react'
import { AlertTriangle, Smile } from 'lucide-react'

interface ResponseItem {
  id: number
  sessionLabel: string
  ratingOverall: number
  ratingStaff: number
  dogCondition: string
  npsScore: number
  feedback: string | null
  submittedAt: string | Date
}

export const AlertList: React.FC<{ responses: ResponseItem[] }> = ({
  responses,
}) => {
  const alerts = responses.filter((r) => r.npsScore <= 6)

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2">
        <Smile className="w-10 h-10 text-emerald-600 fill-emerald-100" />
        <h3 className="text-sm font-bold text-emerald-900">良好照護品質</h3>
        <p className="text-xs text-emerald-700">
          目前尚無低分 (NPS ≤ 6分) 警示，請繼續保持優秀的照護服務！
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-rose-800">
        <AlertTriangle className="w-5 h-5 fill-rose-100 text-rose-600" />
        <h3 className="text-sm font-bold">⚠️ 低分警示區 (NPS ≤ 6)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-rose-900">場次：{a.sessionLabel}</span>
              <span className="text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                NPS {a.npsScore}分
              </span>
            </div>
            <div className="text-xs text-rose-800 font-medium">
              <span>整體滿意度: {a.ratingOverall}★</span>
              <span className="mx-2">|</span>
              <span>人員態度: {a.ratingStaff}★</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-rose-100/50">
              {a.feedback || '（該飼主未填寫具體意見）'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
