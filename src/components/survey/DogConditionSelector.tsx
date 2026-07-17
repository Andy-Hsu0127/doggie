'use client'

import React from 'react'

interface SelectorProps {
  value: 'GREAT' | 'NORMAL' | 'CONCERN'
  onChange: (val: 'GREAT' | 'NORMAL' | 'CONCERN') => void
}

const conditions: {
  key: 'GREAT' | 'NORMAL' | 'CONCERN'
  label: string
  desc: string
}[] = [
  { key: 'GREAT', label: '活蹦亂跳 🐶', desc: '精神非常好' },
  { key: 'NORMAL', label: '健康正常 😐', desc: '與平時無異' },
  { key: 'CONCERN', label: '略顯疲倦 💤', desc: '需要特別留意' },
]

export const DogConditionSelector: React.FC<SelectorProps> = ({
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-amber-900">
      3. 狗狗回到家後的精神狀況如何？
    </span>
    <div className="grid grid-cols-3 gap-2">
      {conditions.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`p-3 border rounded-lg text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
            value === item.key
              ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
              : 'border-amber-200 hover:bg-amber-50/30'
          }`}
        >
          <span className="text-xs font-bold text-amber-900">{item.label}</span>
          <span className="text-[10px] text-amber-700">{item.desc}</span>
        </button>
      ))}
    </div>
  </div>
)
