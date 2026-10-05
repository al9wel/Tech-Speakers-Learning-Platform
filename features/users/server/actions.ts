'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import type { AppRole } from '@/lib/auth/roles'
import { userFormSchema } from '../schemas/user.schema'

const DEFAULT_PASSWORD = '123456789'

export type ActionResult = {
  success: boolean
  message: string
  userId?: string
}

export async function createUserAction(data: {
  full_name: string
  email: string
  role: AppRole
}): Promise<ActionResult> {
  try {
    await requireRole('admin')

    const validated = userFormSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المستخدم غير صالحة',
      }
    }

    const { email, full_name, role } = validated.data
    const admin = createAdminClient()

    // 1. Create auth user with default temporary password
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: full_name || null },
    })

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || 'تعذر إنشاء المستخدم في قاعدة البيانات',
      }
    }

    // 2. Set profile with role and full name
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: full_name || null,
        role,
      })

    if (profileError) {
      // rollback auth user
      await admin.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        message: 'تعذر إنشاء الملف الشخصي للمستخدم',
      }
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `تم إنشاء المستخدم بنجاح بكلمة مرور مؤقتة: ${DEFAULT_PASSWORD}`,
      userId: authData.user.id,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'حدث خطأ غير متوقع أثناء إضافة المستخدم',
    }
  }
}

export async function updateUserAction(data: {
  user_id: string
  full_name: string
  email: string
  role: AppRole
}): Promise<ActionResult> {
  try {
    await requireRole('admin')

    const validated = userFormSchema.safeParse(data)
    if (!validated.success || !data.user_id) {
      return {
        success: false,
        message: validated.error?.issues[0]?.message || 'بيانات التعديل غير مكتملة',
      }
    }

    const { email, full_name, role } = validated.data
    const admin = createAdminClient()

    // 1. Update Auth email & metadata
    const { error: authError } = await admin.auth.admin.updateUserById(data.user_id, {
      email,
      user_metadata: { full_name: full_name || null },
    })

    if (authError) {
      return {
        success: false,
        message: authError.message || 'تعذر تعديل بيانات حساب المستخدم',
      }
    }

    // 2. Update Profile
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: full_name || null,
        role,
      })
      .eq('id', data.user_id)

    if (profileError) {
      return {
        success: false,
        message: 'تعذر تعديل بيانات الملف الشخصي',
      }
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'حدث خطأ أثناء تعديل بيانات المستخدم',
    }
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const { user: currentAdmin } = await requireRole('admin')

    // Safety rule 1: Admin cannot delete himself
    if (!userId || userId === currentAdmin.id) {
      return {
        success: false,
        message: 'لا يمكنك حذف حسابك الشخصي بصفتك المشرف الحالي',
      }
    }

    const admin = createAdminClient()

    // Safety rule 2: Do not delete the final remaining admin
    const { data: targetProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetProfile?.role === 'admin') {
      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          message: 'لا يمكن حذف المشرف الأخير المتبقي في المنصة',
        }
      }
    }

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      return {
        success: false,
        message: error.message || 'تعذر حذف المستخدم من النظام',
      }
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'تم حذف المستخدم بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'حدث خطأ أثناء محاولة حذف المستخدم',
    }
  }
}

// ============================================================
// FormData wrapper actions for use with HTML form action= attribute
// ============================================================

export async function createUser(formData: FormData) {
  const result = await createUserAction({
    full_name: formData.get('full_name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    role: (formData.get('role')?.toString() ?? 'student') as AppRole,
  })

  if (result.success) {
    redirect(`/admin/users?success=${encodeURIComponent(result.message)}`)
  } else {
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`)
  }
}

export async function updateUser(formData: FormData) {
  const result = await updateUserAction({
    user_id: formData.get('user_id')?.toString() ?? '',
    full_name: formData.get('full_name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    role: (formData.get('role')?.toString() ?? 'student') as AppRole,
  })

  if (result.success) {
    redirect(`/admin/users?success=${encodeURIComponent(result.message)}`)
  } else {
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`)
  }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('user_id')?.toString() ?? ''

  const result = await deleteUserAction(userId)

  if (result.success) {
    redirect(`/admin/users?success=${encodeURIComponent(result.message)}`)
  } else {
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`)
  }
}

