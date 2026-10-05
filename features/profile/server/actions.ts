'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAppRole, rolePaths } from '@/lib/auth/roles'

export type ProfileActionResult = {
  success: boolean
  message: string
}

export async function updateProfileAction(data: {
  full_name: string
  email: string
}): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const fullName = data.full_name?.trim() ?? ''
    const email = data.email?.trim() ?? ''

    if (!email) {
      return { success: false, message: 'البريد الإلكتروني مطلوب' }
    }

    // Update email via Supabase Auth if changed
    if (email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) {
        return {
          success: false,
          message: authError.message || 'تعذر تحديث البريد الإلكتروني في خادم المصادقة',
        }
      }
    }

    // Update full_name in profiles using admin client (bypasses RLS issues)
    const admin = createAdminClient()
    const { error: profileError } = await admin
      .from('profiles')
      .update({ full_name: fullName || null })
      .eq('id', user.id)

    if (profileError) {
      return {
        success: false,
        message: profileError.message || 'تعذر تحديث الملف الشخصي في قاعدة البيانات',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && isAppRole(profile.role)) {
      revalidatePath(`${rolePaths[profile.role]}/profile`)
    }

    return {
      success: true,
      message: 'تم تحديث البيانات الشخصية بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'حدث خطأ غير متوقع أثناء تحديث الملف الشخصي',
    }
  }
}

export async function changePasswordAction(data: {
  new_password: string
}): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const newPassword = data.new_password?.trim() ?? ''

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل',
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      return {
        success: false,
        message: error.message || 'تعذر تغيير كلمة المرور',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && isAppRole(profile.role)) {
      revalidatePath(`${rolePaths[profile.role]}/profile`)
    }

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'حدث خطأ غير متوقع أثناء تغيير كلمة المرور',
    }
  }
}

// FormData wrappers with safely encoded URLs for native form actions
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile && isAppRole(profile.role) ? profile.role : 'student'
  const profilePath = `${rolePaths[role]}/profile`

  const result = await updateProfileAction({
    full_name: formData.get('full_name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
  })

  if (result.success) {
    redirect(`${profilePath}?success=${encodeURIComponent(result.message)}`)
  } else {
    redirect(`${profilePath}?error=${encodeURIComponent(result.message)}`)
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile && isAppRole(profile.role) ? profile.role : 'student'
  const profilePath = `${rolePaths[role]}/profile`

  const result = await changePasswordAction({
    new_password: formData.get('new_password')?.toString() ?? '',
  })

  if (result.success) {
    redirect(`${profilePath}?success=${encodeURIComponent(result.message)}`)
  } else {
    redirect(`${profilePath}?error=${encodeURIComponent(result.message)}`)
  }
}
