import { requireRole } from '@/lib/auth/require-role'
import { StudentSuggestionsManager } from '@/features/suggestions/components/StudentSuggestionsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مقترحاتي',
  description: 'متابعة وإرسال المقترحات لإدارة المنصة والمشرفين',
}

export default async function StudentSuggestionsPage() {
  const { user, profile, supabase } = await requireRole('student')

  const { data: suggestions } = await supabase
    .from('suggestions')
    .select(`
      *,
      author:profiles (
        id,
        full_name,
        role
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const studentName = profile?.full_name || 'طالب مسجل'

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <StudentSuggestionsManager
        initialSuggestions={suggestions || []}
        currentUserName={studentName}
      />
    </div>
  )
}
