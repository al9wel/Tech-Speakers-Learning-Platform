import { requireRole } from '@/lib/auth/require-role'
import { StudentCounselingSection } from '@/features/counseling/components/StudentCounselingSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المستشار النفسي والتربوي',
  description: 'التواصل والاستشارات النفسية والتربوية مع نخبة من المستشارين المعتمدين',
}

export default async function StudentCounselingPage() {
  const { user, supabase } = await requireRole('student')

  // Fetch counselors and student counseling messages in parallel
  const [{ data: counselors }, { data: messages }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'counselor')
      .order('full_name', { ascending: true }),
    supabase
      .from('counseling_messages')
      .select(`
        *,
        student:profiles!counseling_messages_student_id_fkey(id, full_name, role),
        counselor:profiles!counseling_messages_counselor_id_fkey(id, full_name, role),
        sender:profiles!counseling_messages_sender_id_fkey(id, full_name, role),
        replies:counseling_replies(
          id,
          message_id,
          sender_id,
          content,
          created_at,
          author:profiles!counseling_replies_sender_id_fkey(id, full_name, role)
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <StudentCounselingSection
        initialMessages={(messages as any) || []}
        counselors={(counselors as any) || []}
        currentUserId={user.id}
      />
    </div>
  )
}
