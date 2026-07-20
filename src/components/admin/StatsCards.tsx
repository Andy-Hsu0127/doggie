import React from 'react'

interface Stats {
  totalCount: number
  avgOverall: number
  avgStaff: number
  npsScore: number
}

export const StatsCards: React.FC<{ stats: Stats }> = ({ stats }) => {
  const cards = [
    {
      title: '問卷填寫總數',
      value: `${stats.totalCount} 份`,
      desc: '累計回收有效問卷',
    },
    {
      title: '淨推薦值 (NPS)',
      value: `${stats.npsScore >= 0 ? '+' : ''}${stats.npsScore} 分`,
      desc: '推薦者 (9-10分) % 減 批評者 (0-6分) %',
      color:
        stats.npsScore >= 50
          ? 'text-emerald-600'
          : stats.npsScore >= 0
            ? 'text-orange-600'
            : 'text-rose-600',
    },
    {
      title: '整體滿意度',
      value: `${stats.avgOverall} ★`,
      desc: '服務品質平均評分 (滿分 5 星)',
    },
    {
      title: '照顧與司機滿意度',
      value: `${stats.avgStaff} ★`,
      desc: '人員態度平均評分 (滿分 5 星)',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-amber-100/80 shadow-sm flex flex-col gap-1.5"
        >
          <span className="text-xs font-semibold text-amber-800">{c.title}</span>
          <span
            className={`text-2xl font-bold font-sans ${c.color || 'text-amber-900'}`}
          >
            {c.value}
          </span>
          <span className="text-[10px] text-amber-600 leading-normal">
            {c.desc}
          </span>
        </div>
      ))}
    </div>
  )
}
