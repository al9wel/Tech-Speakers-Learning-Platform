import { requireRole } from '@/lib/auth/require-role'
import { SupervisorLessonsManager } from '@/features/lessons/components/SupervisorLessonsManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'إدارة الدروس | لوحة الإشراف',
  description: 'استعراض ومتابعة وحذف الدروس المنشورة في المنصة',
}

export default async function SupervisorLessonsPage() {
  const { supabase } = await requireRole('supervisor')

  // Fetch all subjects for filter
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  // Fetch all lessons with subject, creator profile, and section count
  const { data: rawLessons, error } = await supabase
    .from('lessons')
    .select(`
      *,
      subject:subjects (
        id,
        name
      ),
      teacher:profiles!lessons_created_by_fkey (
        id,
        full_name
      ),
      lesson_sections (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lessons for supervisor:', error)
  }

  const lessons = (rawLessons ?? []).map((l: any) => ({
    id: l.id,
    subject_id: l.subject_id,
    title: l.title,
    explanation: l.explanation,
    sort_order: l.sort_order,
    created_by: l.created_by,
    created_at: l.created_at,
    updated_at: l.updated_at,
    subject: l.subject,
    teacher: l.teacher,
    sectionsCount: Array.isArray(l.lesson_sections)
      ? l.lesson_sections[0]?.count ?? 0
      : 0,
  }))

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <SupervisorLessonsManager
        initialLessons={lessons}
        subjects={subjects || []}
      />
    </div>
  )
}
