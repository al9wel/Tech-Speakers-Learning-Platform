import { requireRole } from '@/lib/auth/require-role'
import { SupervisorSuggestionsManager } from '@/features/suggestions/components/SupervisorSuggestionsManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'صندوق مقترحات الطلاب',
  description: 'استعراض ومتابعة مقترحات الطلاب الواردة للإدارة',
}

export default async function SupervisorSuggestionsPage() {
  const { supabase } = await requireRole('supervisor')

  const { data: suggestions, error } = await supabase
    .from('suggestions')
    .select(`
      *,
      author:profiles (
        id,
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching supervisor suggestions:', error)
  }

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <SupervisorSuggestionsManager
        initialSuggestions={suggestions || []}
      />
    </div>
  )
}
