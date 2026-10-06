import { z } from 'zod'

export const suggestionFormSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان المقترح يجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'عنوان المقترح طويل جداً'),
  content: z
    .string()
    .min(10, 'يرجى كتابة شرح وافٍ للمقترح (10 أحرف على الأقل)')
    .max(3000, 'شرح المقترح طويل جداً'),
  category: z.string().min(1, 'يرجى اختيار تصنيف المقترح'),
})

export type SuggestionFormValues = z.infer<typeof suggestionFormSchema>
