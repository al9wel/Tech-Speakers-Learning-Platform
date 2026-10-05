import { z } from 'zod'

export const subjectFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'اسم المادة يجب أن يتكون من حرفين على الأقل')
    .max(100, 'اسم المادة يجب ألا يتجاوز 100 حرف'),
})

export type SubjectFormValues = z.infer<typeof subjectFormSchema>

export const createSubjectActionSchema = z.object({
  id: z.string().uuid('معرف المادة غير صالح'),
  name: z
    .string()
    .min(2, 'اسم المادة يجب أن يتكون من حرفين على الأقل')
    .max(100, 'اسم المادة يجب ألا يتجاوز 100 حرف'),
  image_path: z.string().nullable().optional(),
})

export const updateSubjectActionSchema = z.object({
  id: z.string().uuid('معرف المادة غير صالح'),
  name: z
    .string()
    .min(2, 'اسم المادة يجب أن يتكون من حرفين على الأقل')
    .max(100, 'اسم المادة يجب ألا يتجاوز 100 حرف'),
  image_path: z.string().nullable().optional(),
  remove_image: z.boolean().optional(),
})
