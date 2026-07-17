'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StarRating } from './StarRating'
import { NpsSlider } from './NpsSlider'
import { DogConditionSelector } from './DogConditionSelector'

export const SurveyForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionLabel =
    searchParams.get('session') || new Date().toISOString().split('T')[0]

  const [ratingOverall, setRatingOverall] = useState(5)
  const [ratingStaff, setRatingStaff] = useState(5)
  const [dogCondition, setDogCondition] = useState<
    'GREAT' | 'NORMAL' | 'CONCERN'
  >('GREAT')
  const [npsScore, setNpsScore] = useState(10)
  const [feedback, setFeedback] = useState('')
  const [hasConsented, setHasConsented] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasConsented) return setErrorMsg('您必須同意個資收集聲明才能提交問卷')
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/survey/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionLabel,
          ratingOverall,
          ratingStaff,
          dogCondition,
          npsScore,
          feedback,
          hasConsented,
        }),
      })
      const result = await res.json()
      if (result.success) router.push('/success')
      else setErrorMsg(result.error?.message || '提交失敗，請稍後再試')
    } catch {
      setErrorMsg('網路連線失敗，請檢查您的網路連線')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {errorMsg}
        </div>
      )}
      <div className="flex items-center text-xs text-amber-800 bg-amber-50 p-2 rounded-md justify-between font-mono">
        <span>本次接送場次代碼：</span>
        <span className="font-bold">{sessionLabel}</span>
      </div>
      <StarRating
        rating={ratingOverall}
        onChange={setRatingOverall}
        label="1. 整體而言，您對本次狗狗照護服務有多滿意？"
      />
      <StarRating
        rating={ratingStaff}
        onChange={setRatingStaff}
        label="2. 您對我們照顧員與接送司機的態度有多滿意？"
      />
      <DogConditionSelector value={dogCondition} onChange={setDogCondition} />
      <NpsSlider score={npsScore} onChange={setNpsScore} />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-amber-900">
          5. 任何想對我們說的悄悄話或改進建議？（選填）
        </span>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="謝謝您的回饋，我們會繼續努力！"
          className="p-3 border border-amber-200 rounded-lg focus:outline-none focus:border-orange-500 text-sm bg-white/50"
          data-testid="feedback-input"
        />
      </div>
      <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-amber-800 leading-relaxed bg-amber-50/30 p-3 rounded-lg border border-amber-100">
        <input
          type="checkbox"
          checked={hasConsented}
          onChange={(e) => setHasConsented(e.target.checked)}
          className="mt-0.5 rounded border-amber-300 text-orange-600 focus:ring-orange-500"
          data-testid="consent-checkbox"
          required
        />
        <span>
          我已閱讀並同意，本次填寫的資料將由「<strong>毛孩照護</strong>
          」依台灣《個人資料保護法》進行安全蒐集與處理，用於服務品質改善與未來場地規劃市調。
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm disabled:opacity-75 disabled:cursor-not-allowed"
        data-testid="submit-button"
      >
        {loading ? '正在提交回饋...' : '提交滿意度問卷 🐾'}
      </button>
    </form>
  )
}
