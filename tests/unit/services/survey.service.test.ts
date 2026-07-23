import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SurveyService } from '@/services/survey.service'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    surveySatisfaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('SurveyService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createSatisfaction', () => {
    it('should call db.surveySatisfaction.create with mapped data and serial number', async () => {
      vi.mocked(db.surveySatisfaction.count).mockResolvedValue(0)
      const input = {
        sessionLabel: '2026-07-17',
        ratingOverall: 5,
        ratingStaff: 5,
        dogCondition: 'GREAT' as const,
        npsScore: 10,
        feedback: 'Good',
        hasConsented: true as const,
      }
      await SurveyService.createSatisfaction(input)
      expect(db.surveySatisfaction.create).toHaveBeenCalledWith({
        data: {
          sessionLabel: '20260717-A01',
          ratingOverall: 5,
          ratingStaff: 5,
          dogCondition: 'GREAT',
          npsScore: 10,
          feedback: 'Good',
          consented: true,
        },
      })
    })
  })

  describe('getSatisfactionStats', () => {
    it('should return default stats when no surveys exist', async () => {
      vi.mocked(db.surveySatisfaction.aggregate).mockResolvedValue({
        _count: { id: 0 },
        _avg: { ratingOverall: null, ratingStaff: null },
      } as any)
      vi.mocked(db.surveySatisfaction.groupBy).mockResolvedValue([])
      vi.mocked(db.surveySatisfaction.findMany).mockResolvedValue([])

      const stats = await SurveyService.getSatisfactionStats()
      expect(stats).toEqual({
        totalCount: 0,
        avgOverall: 0,
        avgStaff: 0,
        npsScore: 0,
        dogConditions: { GREAT: 0, NORMAL: 0, CONCERN: 0 },
        weeklyTrends: [],
      })
    })

    it('should calculate averages and NPS score correctly', async () => {
      vi.mocked(db.surveySatisfaction.aggregate).mockResolvedValue({
        _count: { id: 3 },
        _avg: { ratingOverall: 4.0, ratingStaff: 3.333 },
      } as any)
      vi.mocked(db.surveySatisfaction.groupBy).mockResolvedValue([
        { dogCondition: 'GREAT', _count: { id: 1 } },
        { dogCondition: 'NORMAL', _count: { id: 1 } },
        { dogCondition: 'CONCERN', _count: { id: 1 } },
      ] as any)
      vi.mocked(db.surveySatisfaction.findMany).mockResolvedValue([
        { npsScore: 10, submittedAt: new Date('2026-07-15') },
        { npsScore: 8, submittedAt: new Date('2026-07-15') },
        { npsScore: 5, submittedAt: new Date('2026-07-15') },
      ] as any)

      const stats = await SurveyService.getSatisfactionStats()
      expect(stats.totalCount).toBe(3)
      expect(stats.avgOverall).toBe(4.0)
      expect(stats.avgStaff).toBe(3.3)
      expect(stats.npsScore).toBe(0)
    })
  })
})

