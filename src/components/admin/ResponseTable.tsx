import React, { useState } from 'react'

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

export const ResponseTable: React.FC<{ responses: ResponseItem[] }> = ({
  responses,
}) => {
  const [search, setSearch] = useState('')

  const filtered = responses.filter(
    (r) =>
      r.sessionLabel.toLowerCase().includes(search.toLowerCase()) ||
      (r.feedback && r.feedback.toLowerCase().includes(search.toLowerCase()))
  )

  const getConditionLabel = (cond: string) => {
    if (cond === 'GREAT') return '活蹦亂跳 🐶'
    if (cond === 'NORMAL') return '正常 😐'
    return '略顯疲倦 💤'
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100/80 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xs font-bold text-amber-800">所有問卷填寫紀錄</h3>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋場次或回饋意見..."
          className="px-3 py-1.5 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs w-full sm:w-[220px]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/50 text-amber-850 font-semibold">
              <th className="p-3">提交時間</th>
              <th className="p-3">場次</th>
              <th className="p-3">整體評分</th>
              <th className="p-3">人員態度</th>
              <th className="p-3">狗狗狀態</th>
              <th className="p-3">NPS 推薦</th>
              <th className="p-3">回饋建議</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-amber-600">
                  無符合條件的問卷紀錄
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-amber-50 hover:bg-amber-50/10 text-amber-900 transition-colors"
                >
                  <td className="p-3 font-mono">
                    {new Date(r.submittedAt)
                      .toLocaleString('zh-TW', { hour12: false })
                      .replace(/\//g, '-')}
                  </td>
                  <td className="p-3 font-semibold">{r.sessionLabel}</td>
                  <td className="p-3">{r.ratingOverall}★</td>
                  <td className="p-3">{r.ratingStaff}★</td>
                  <td className="p-3">{getConditionLabel(r.dogCondition)}</td>
                  <td className="p-3 font-bold">{r.npsScore}分</td>
                  <td
                    className="p-3 max-w-[200px] truncate"
                    title={r.feedback || ''}
                  >
                    {r.feedback || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
