'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rolePaths, isAppRole } from '@/lib/auth/roles'

export type AuthActionResult = {
  success: boolean
  message?: string
  redirectTo?: string
}

export async function loginAction(data: {
  email: string
  password: string
}): Promise<AuthActionResult> {
  const supabase = await createClient()
  const email = data.email?.trim() ?? ''
  const password = data.password ?? ''

  if (!email || !password) {
    return { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !authData.user) {
    return {
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile || !isAppRole(profile.role)) {
    await supabase.auth.signOut()
    return {
      success: false,
      message: 'لا تتوفر صلاحيات صالحة لهذا الحساب في النظام',
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    redirectTo: rolePaths[profile.role],
  }
}

export async function signupAction(data: {
  full_name: string
  email: string
  password: string
}): Promise<AuthActionResult> {
  const supabase = await createClient()
  const fullName = data.full_name?.trim() ?? ''
  const email = data.email?.trim() ?? ''
  const password = data.password ?? ''

  if (!fullName) {
    return { success: false, message: 'الاسم الكامل مطلوب' }
  }
  if (!email) {
    return { success: false, message: 'البريد الإلكتروني مطلوب' }
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return {
      success: false,
      message: error.message.includes('already registered')
        ? 'هذا البريد الإلكتروني مسجل بالفعل'
        : error.message || 'حدث خطأ أثناء إنشاء الحساب',
    }
  }

  if (authData.user && fullName) {
    try {
      const admin = createAdminClient()
      await admin.from('profiles').upsert({
        id: authData.user.id,
        role: 'student',
        full_name: fullName,
      })
    } catch {
      // Fallback silently if admin client fails; trigger handle_new_user handles it
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    redirectTo: '/verify-email',
  }
}

// Native Form Actions (preserved with full_name support)
export async function signup(formData: FormData) {
  const fullName = formData.get('full_name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const res = await signupAction({ full_name: fullName, email, password })

  if (!res.success) {
    redirect(`/signup?error=${encodeURIComponent(res.message || 'Error')}`)
  }

  redirect(res.redirectTo || '/verify-email')
}

export async function login(formData: FormData) {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const res = await loginAction({ email, password })

  if (!res.success) {
    redirect(`/login?error=${encodeURIComponent(res.message || 'Error')}`)
  }

  redirect(res.redirectTo || '/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
