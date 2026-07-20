import React from 'react'

interface Trend {
  week: string
  nps: number
  avgRating: number
}

interface ChartsSectionProps {
  dogConditions: { GREAT: number; NORMAL: number; CONCERN: number }
  weeklyTrends: Trend[]
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  dogConditions,
  weeklyTrends,
}) => {
  const total =
    dogConditions.GREAT + dogConditions.NORMAL + dogConditions.CONCERN
  const getWidth = (val: number) => `${total > 0 ? (val / total) * 100 : 0}%`

  const width = 300
  const height = 100
  const pad = 15
  const points = weeklyTrends.map((t, idx) => {
    const x = pad + (idx * (width - pad * 2)) / Math.max(1, weeklyTrends.length - 1)
    const y = height - pad - ((t.nps + 100) * (height - pad * 2)) / 200
    return { x, y, ...t }
  })
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <div className="bg-white rounded-2xl p-5 border border-amber-100/80 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold text-amber-800">狗狗回家後精神狀況分佈</h3>
        <div className="flex flex-col gap-3 justify-center h-full">
          {[
            { k: 'GREAT', l: '活蹦亂跳 🐶', c: 'bg-emerald-500', v: dogConditions.GREAT },
            { k: 'NORMAL', l: '健康正常 😐', c: 'bg-amber-400', v: dogConditions.NORMAL },
            { k: 'CONCERN', l: '略顯疲倦 💤', c: 'bg-rose-500', v: dogConditions.CONCERN },
          ].map((item) => (
            <div key={item.k} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-amber-900">
                <span>{item.l}</span>
                <span>{item.v} 隻</span>
              </div>
              <div className="w-full h-3 bg-amber-50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.c} rounded-full transition-all duration-500`}
                  style={{ width: getWidth(item.v) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/80 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold text-amber-800">每週淨推薦值 (NPS) 趨勢折線圖</h3>
        <div className="relative w-full flex items-center justify-center bg-amber-50/20 rounded-xl p-2 h-[120px]">
          {weeklyTrends.length === 0 ? (
            <span className="text-xs text-amber-600">目前尚無足夠趨勢數據</span>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="#fcd34d" strokeDasharray="3 3" />
              <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points={polylinePoints} />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#f97316" className="cursor-pointer" />
                  <text x={p.x} y={p.y - 8} fontSize="7" fill="#c2410c" textAnchor="middle" className="font-bold font-sans">
                    {p.nps >= 0 ? '+' : ''}{p.nps}
                  </text>
                  <text x={p.x} y={height - 2} fontSize="7" fill="#78350f" textAnchor="middle">
                    {p.week}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
