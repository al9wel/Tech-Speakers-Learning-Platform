import { z } from 'zod'

export const counselingMessageSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان الاستشارة يجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'عنوان الاستشارة طويل جداً'),
  content: z
    .string()
    .min(5, 'يرجى كتابة نص الرسالة أو الاستشارة (5 أحرف على الأقل)')
    .max(5000, 'نص الرسالة طويل جداً'),
  counselor_id: z.string().uuid('معرف المستشار غير صالح').optional(),
  student_id: z.string().uuid('معرف الطالب غير صالح').optional(),
})

export const counselingReplySchema = z.object({
  message_id: z.string().uuid('معرف الرسالة غير صالح'),
  content: z
    .string()
    .min(2, 'يرجى كتابة نص الرد (حرفين على الأقل)')
    .max(5000, 'نص الرد طويل جداً'),
})

export type CounselingMessageFormValues = z.infer<typeof counselingMessageSchema>
export type CounselingReplyFormValues = z.infer<typeof counselingReplySchema>
