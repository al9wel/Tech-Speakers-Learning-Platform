import { requireRole } from '@/lib/auth/require-role'
import { CounselorCommunicationsManager } from '@/features/counseling/components/CounselorCommunicationsManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'التواصل والاستشارات مع الطلاب',
  description: 'إدارة ومتابعة استشارات ورسائل الطلاب والرد عليها والتواصل معهم',
}

export default async function CounselorStudentsPage() {
  const { user, supabase } = await requireRole('counselor')

  // Fetch all students for search/initiating message
  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  // Fetch counselor messages
  const { data: messages } = await supabase
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
    .eq('counselor_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <CounselorCommunicationsManager
        initialMessages={(messages as any) || []}
        allStudents={(allStudents as any) || []}
        currentUserId={user.id}
      />
    </div>
  )
}
