import { AuthTabs } from '@/features/auth/components/AuthTabs'

export const dynamic = 'force-dynamic'

interface AuthPageProps {
  searchParams: Promise<{ mode?: 'login' | 'signup' }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams
  const initialMode = params?.mode === 'signup' ? 'signup' : 'login'
  return <AuthTabs initialMode={initialMode} />
}
