import { requireRole } from '@/lib/auth/require-role'
import { ProfilePage } from '@/features/profile/components/ProfilePage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الملف الشخصي',
  description: 'إدارة وتعديل بيانات الحساب الشخصي للمعلم',
}

interface PageProps {
    searchParams: Promise<{ error?: string; success?: string }>
}

export default async function TeacherProfilePage({ searchParams }: PageProps) {
    const { user, supabase } = await requireRole('teacher')

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
            role="teacher"
            createdAt={profile?.created_at ?? ''}
            backUrl="/teacher"
            errorMessage={params.error}
            successMessage={params.success}
        />
    )
}
