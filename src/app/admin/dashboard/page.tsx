import React from 'react'
import { redirect } from 'next/navigation'
import { authorizeAdmin } from '@/lib/auth-helpers'
import { SurveyService } from '@/services/survey.service'
import { StatsCards } from '@/components/admin/StatsCards'
import { ChartsSection } from '@/components/admin/ChartsSection'
import { AlertList } from '@/components/admin/AlertList'
import { ResponseTable } from '@/components/admin/ResponseTable'

export default async function DashboardPage() {
  const admin = await authorizeAdmin()
  if (!admin) {
    redirect('/login')
  }

  const [stats, responses] = await Promise.all([
    SurveyService.getSatisfactionStats(),
    SurveyService.getSatisfactionResponses(),
  ])

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

