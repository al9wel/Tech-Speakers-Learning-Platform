import { AuthTabs } from '@/features/auth/components/AuthTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تسجيل الدخول وإنشاء حساب',
  description: 'الدخول إلى المنصة التعليمية للطلاب والمعلمين والمستشارين والمشرفين',
}

interface AuthPageProps {
  searchParams: Promise<{ mode?: 'login' | 'signup' | 'signup_student' | 'signup_teacher' | 'signup_counselor' }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams
  let initialMode: 'login' | 'signup_student' | 'signup_teacher' | 'signup_counselor' = 'login'
  if (params?.mode === 'signup' || params?.mode === 'signup_student') {
    initialMode = 'signup_student'
  } else if (params?.mode === 'signup_teacher') {
    initialMode = 'signup_teacher'
  } else if (params?.mode === 'signup_counselor') {
    initialMode = 'signup_counselor'
  }
  return <AuthTabs initialMode={initialMode} />
}
