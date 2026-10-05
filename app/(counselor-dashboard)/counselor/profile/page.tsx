import { requireRole } from '@/lib/auth/require-role'
import { ProfilePage } from '@/features/profile/components/ProfilePage'

interface PageProps {
    searchParams: Promise<{ error?: string; success?: string }>
}

export default async function CounselorProfilePage({ searchParams }: PageProps) {
    const { user, supabase } = await requireRole('counselor')

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
            role="counselor"
            createdAt={profile?.created_at ?? ''}
            backUrl="/counselor"
            errorMessage={params.error}
            successMessage={params.success}
        />
    )
}
