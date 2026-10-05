import { z } from 'zod'

export const counselorFormSchema = z.object({
  user_id: z.string().optional(),
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

export type CounselorFormValues = z.infer<typeof counselorFormSchema>
