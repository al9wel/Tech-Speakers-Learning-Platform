import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { LessonsTable } from '@/features/lessons/components/LessonsTable'
import type { LessonItem } from '@/features/lessons/types'
import { BookOpen, ArrowRight, AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة الدروس التعليمية',
  description: 'إدارة وتعديل ونشر الدروس التعليمية وأقسامها',
}

export default async function TeacherLessonsPage() {
  const { user, supabase } = await requireRole('teacher')

  // Fetch only lessons created by this teacher
  const { data: rawLessons, error } = await supabase
    .from('lessons')
    .select(`
      *,
      subject:subjects (
        id,
        name
      ),
      lesson_sections (count)
    `)
    .eq('created_by', user.id)
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <div className="container-page py-12 animate-page">
        <div className="card p-8 bg-white border-red-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            حدث خطأ أثناء تحميل الدروس
          </h2>
          <p className="text-sm text-ink-500 mb-5 leading-relaxed">
            {error.message || 'تعذر جلب قائمة دروسك من قاعدة البيانات.'}
          </p>
          <Link href="/teacher" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>العودة لواجهة المعلم</span>
          </Link>
        </div>
      </div>
    )
  }

  const lessons: LessonItem[] = (rawLessons ?? []).map((l) => ({
    id: l.id,
    subject_id: l.subject_id,
    title: l.title,
    explanation: l.explanation,
    sort_order: l.sort_order,
    created_by: l.created_by,
    created_at: l.created_at,
    updated_at: l.updated_at,
    subject: l.subject as any,
    sectionsCount: Array.isArray(l.lesson_sections)
      ? (l.lesson_sections[0] as any)?.count ?? 0
      : 0,
  }))

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark border border-gold/30 flex items-center justify-center shrink-0 shadow-soft">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة الدروس التعليمية
            </h1>
            <p className="text-sm text-ink-500">
              قائمة الدروس التي قمت بإعدادها ومشاركتها مع طلابك
            </p>
          </div>
        </div>

        <Link
          href="/teacher"
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة المعلم</span>
        </Link>
      </div>

      {/* TanStack Table for Teacher's Lessons */}
      <LessonsTable data={lessons} />
    </div>
  )
}
