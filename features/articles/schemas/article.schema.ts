import { z } from 'zod'

export const articleFormSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان الخبر أو المقال يجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'العنوان طويل جداً'),
  content: z
    .string()
    .min(10, 'يرجى كتابة نص المقال أو الخبر بشكل كافٍ (10 أحرف على الأقل)')
    .max(10000, 'النص طويل جداً'),
  category: z.string().min(1, 'يرجى تحديد التصنيف'),
  image_path: z.string().nullable().optional(),
  pdf_path: z.string().nullable().optional(),
  video_path: z.string().nullable().optional(),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>
