'use client'

import React from 'react'

interface NpsSliderProps {
  score: number
  onChange: (score: number) => void
}

export const NpsSlider: React.FC<NpsSliderProps> = ({ score, onChange }) => {
  const getEmoji = (val: number) => {
    if (val >= 9) {
      return { emoji: '😊', label: '極力推薦', color: 'text-emerald-600' }
    }
    if (val >= 7) {
      return { emoji: '😐', label: '普通滿意', color: 'text-amber-600' }
    }
    return { emoji: '😢', label: '需要改進', color: 'text-rose-600' }
  }

  const { emoji, label, color } = getEmoji(score)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-amber-900">
          您有多願意將我們的服務推薦給親友？
        </span>
        <span className={`text-2xl font-bold ${color}`} data-testid="nps-display">
          {score} <span className="text-lg">{emoji}</span>
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={score}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        data-testid="nps-slider"
      />
      <div className="flex justify-between text-xs text-amber-800 font-medium">
        <span>0分 (絕不推薦)</span>
        <span className="text-center">{label}</span>
        <span>10分 (極度推薦) | 推薦者: 9-10分</span>
      </div>
    </div>
  )
}
