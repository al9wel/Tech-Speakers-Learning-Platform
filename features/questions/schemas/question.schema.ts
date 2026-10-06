import { z } from 'zod'

export const questionFormSchema = z.object({
  id: z.string().optional(),
  lesson_id: z.string().uuid('يرجى اختيار الدرس المرتبط بهذا السؤال'),
  title: z
    .string()
    .min(3, 'عنوان السؤال يجب أن يتكون من 3 أحرف على الأقل')
    .max(200, 'عنوان السؤال يجب ألا يتجاوز 200 حرف'),
  content: z
    .string()
    .min(5, 'تفاصيل السؤال يجب أن تتكون من 5 أحرف على الأقل')
    .max(3000, 'تفاصيل السؤال طويلة جداً'),
})

export type QuestionFormValues = z.infer<typeof questionFormSchema>

export const answerFormSchema = z.object({
  question_id: z.string().uuid('معرف السؤال غير صالح'),
  content: z
    .string()
    .min(2, 'الإجابة أو التعليق يجب ألا يقل عن حرفين')
    .max(2000, 'الإجابة يجب ألا تتجاوز 2000 حرف'),
})

export type AnswerFormValues = z.infer<typeof answerFormSchema>
