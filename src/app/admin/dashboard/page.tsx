'use client'

import React, { useEffect, useState } from 'react'
import { StatsCards } from '@/components/admin/StatsCards'
import { ChartsSection } from '@/components/admin/ChartsSection'
import { AlertList } from '@/components/admin/AlertList'
import { ResponseTable } from '@/components/admin/ResponseTable'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, listRes] = await Promise.all([
          fetch('/api/admin/stats').then((r) => r.json()),
          fetch('/api/admin/responses').then((r) => r.json()),
        ])

        if (statsRes.success && listRes.success) {
          setStats(statsRes.data)
          setResponses(listRes.data)
        } else {
          setError(
            statsRes.error?.message ||
              listRes.error?.message ||
              '讀取後台資料失敗'
          )
        }
      } catch {
        setError('連線失敗，請檢查網路狀態')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm font-semibold text-amber-800">
        載入後台分析數據中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm font-semibold text-rose-700">
        錯誤：{error}
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <h2 className="text-lg font-bold text-amber-900 font-sans">
        問卷滿意度分析總覽
      </h2>
      <StatsCards stats={stats} />
      <ChartsSection
        dogConditions={stats.dogConditions}
        weeklyTrends={stats.weeklyTrends}
      />
      <AlertList responses={responses} />
      <ResponseTable responses={responses} />
    </div>
  )
}
