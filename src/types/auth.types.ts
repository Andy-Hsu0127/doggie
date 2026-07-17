import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('請輸入正確的電子信箱格式'),
  password: z.string().min(6, '密碼長度最少需要 6 個字元'),
})

export type LoginInput = z.infer<typeof LoginSchema>
