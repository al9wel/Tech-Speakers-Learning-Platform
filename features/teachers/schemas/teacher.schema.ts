import { z } from 'zod'

export const teacherFormSchema = z.object({
  user_id: z.string().optional(),
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

export type TeacherFormValues = z.infer<typeof teacherFormSchema>
