import { z } from 'zod'

export const contributionFormSchema = z.object({
  subject_id: z.string().uuid('يرجى اختيار المادة الدراسية التابعة للمساهمة'),
  title: z
    .string()
    .min(3, 'عنوان المساهمة يجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'عنوان المساهمة طويل جداً'),
  content: z
    .string()
    .min(10, 'يرجى كتابة شرح وتفاصيل المساهمة (10 أحرف على الأقل)')
    .max(4000, 'شرح وتفاصيل المساهمة طويل جداً'),
  image_path: z.string().nullable().optional(),
  pdf_path: z.string().nullable().optional(),
})

export type ContributionFormValues = z.infer<typeof contributionFormSchema>
