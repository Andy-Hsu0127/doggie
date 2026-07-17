import { z } from 'zod'

export const SurveySatisfactionSchema = z.object({
  sessionLabel: z.string().min(1, '接送場次標籤為必填'),
  ratingOverall: z
    .number()
    .int()
    .min(1, '滿意度評分最低為 1 星')
    .max(5, '滿意度評分最高為 5 星'),
  ratingStaff: z
    .number()
    .int()
    .min(1, '照顧員評分最低為 1 星')
    .max(5, '照顧員評分最高為 5 星'),
  dogCondition: z.enum(['GREAT', 'NORMAL', 'CONCERN'], {
    errorMap: () => ({ message: '狗狗狀況必須為 GREAT, NORMAL 或 CONCERN' }),
  }),
  npsScore: z
    .number()
    .int()
    .min(0, 'NPS 推薦度最低為 0 分')
    .max(10, 'NPS 推薦度最高為 10 分'),
  feedback: z.string().max(1000, '意見回饋長度不得超過 1000 字').optional(),
  hasConsented: z.literal(true, {
    errorMap: () => ({ message: '您必須同意個資收集聲明才能提交問卷' }),
  }),
})

export type SurveySatisfactionInput = z.infer<typeof SurveySatisfactionSchema>
