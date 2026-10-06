import { requireRole } from '@/lib/auth/require-role'
import { ProfilePage } from '@/features/profile/components/ProfilePage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الملف الشخصي',
  description: 'إدارة وتعديل بيانات الحساب الشخصي للمشرف التربوي',
}

interface PageProps {
    searchParams: Promise<{ error?: string; success?: string }>
}

export default async function SupervisorProfilePage({ searchParams }: PageProps) {
    const { user, supabase } = await requireRole('supervisor')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, created_at')
        .eq('id', user.id)
        .single()

    const params = await searchParams

    return (
        <ProfilePage
            email={user.email ?? ''}
            fullName={profile?.full_name ?? null}
            role="supervisor"
            createdAt={profile?.created_at ?? ''}
            backUrl="/supervisor"
            errorMessage={params.error}
            successMessage={params.success}
        />
    )
}
