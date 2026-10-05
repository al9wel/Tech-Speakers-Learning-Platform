import { z } from 'zod'

export const sectionFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(2, 'عنوان القسم يجب أن يتكون من حرفين على الأقل')
    .max(150, 'عنوان القسم يجب ألا يتجاوز 150 حرف'),
  content: z.string().min(5, 'محتوى القسم يجب أن يتكون من 5 أحرف على الأقل'),
  image_path: z.string().nullable().optional(),
  pdf_path: z.string().nullable().optional(),
  sort_order: z.number().int().min(0),
})

export type SectionFormValues = z.infer<typeof sectionFormSchema>

export const lessonFormSchema = z.object({
  id: z.string().optional(),
  subject_id: z.string().uuid('يرجى اختيار المادة الدراسية'),
  title: z
    .string()
    .min(2, 'عنوان الدرس يجب أن يتكون من حرفين على الأقل')
    .max(150, 'عنوان الدرس يجب ألا يتجاوز 150 حرف'),
  explanation: z
    .string()
    .min(5, 'الشرح التمهيدي للدرس يجب أن يتكون من 5 أحرف على الأقل'),
  sort_order: z
    .number()
    .int('الترتيب يجب أن يكون رقماً صحيحاً')
    .min(0, 'الترتيب يجب ألا يقل عن 0'),
  sections: z.array(sectionFormSchema),
})

export type LessonFormValues = z.infer<typeof lessonFormSchema>

export const createLessonActionSchema = z.object({
  id: z.string().uuid('معرف الدرس غير صالح'),
  subject_id: z.string().uuid('معرف المادة غير صالح'),
  title: z.string().min(2).max(150),
  explanation: z.string().min(5),
  sort_order: z.number().int().min(0).default(0),
  sections: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(2).max(150),
        content: z.string().min(5),
        image_path: z.string().nullable().optional(),
        pdf_path: z.string().nullable().optional(),
        sort_order: z.number().int().default(0),
      })
    )
    .default([]),
})

export const updateLessonActionSchema = z.object({
  id: z.string().uuid('معرف الدرس غير صالح'),
  subject_id: z.string().uuid('معرف المادة غير صالح'),
  title: z.string().min(2).max(150),
  explanation: z.string().min(5),
  sort_order: z.number().int().min(0).default(0),
  sections: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(2).max(150),
        content: z.string().min(5),
        image_path: z.string().nullable().optional(),
        pdf_path: z.string().nullable().optional(),
        sort_order: z.number().int().default(0),
      })
    )
    .default([]),
})
