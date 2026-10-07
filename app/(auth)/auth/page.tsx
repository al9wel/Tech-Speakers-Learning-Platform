import { AuthTabs } from '@/features/auth/components/AuthTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تسجيل الدخول وإنشاء حساب',
  description: 'الدخول إلى المنصة التعليمية للطلاب والمعلمين والمستشارين والمشرفين',
}

interface AuthPageProps {
  searchParams: Promise<{ mode?: 'login' | 'signup' }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams
  const initialMode = params?.mode === 'signup' ? 'signup' : 'login'
  return <AuthTabs initialMode={initialMode} />
}
