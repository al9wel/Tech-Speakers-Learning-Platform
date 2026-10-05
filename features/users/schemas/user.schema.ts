import { z } from 'zod';
import { isAppRole, type AppRole } from '@/lib/auth/roles';

export const userFormSchema = z.object({
  user_id: z.string().optional(),
  full_name: z.string().min(2, 'الاسم الكامل يجب أن يتكون من حرفين على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
  role: z.custom<AppRole>((val) => typeof val === 'string' && isAppRole(val), {
    message: 'يرجى اختيار دور صالح',
  }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
