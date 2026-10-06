import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
import { SubjectLessonsExplorer, type SubjectLessonItem } from '@/features/subjects/components/SubjectLessonsExplorer'
import { BookOpen, ArrowRight, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: subject } = await supabase.from('subjects').select('name').eq('id', id).single()
  return {
    title: subject?.name ? `مادة ${subject.name}` : 'تفاصيل المادة الدراسية',
  }
}

export default async function StudentSubjectLessonsPage({ params }: PageProps) {
  const { id: subjectId } = await params
  const { supabase } = await requireRole('student')

  // Fetch subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .single()

  if (subjectError || !subject) {
    notFound()
  }

  // Fetch all lessons for this subject along with creator profile
  const { data: rawLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      explanation,
      sort_order,
      created_by,
      lesson_sections (count),
      creator:profiles!lessons_created_by_fkey (
        id,
        full_name
      )
    `)
    .eq('subject_id', subjectId)
    .order('sort_order', { ascending: true })

  const lessons: SubjectLessonItem[] = (rawLessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    explanation: l.explanation || '',
    sort_order: l.sort_order,
    sectionsCount: Array.isArray(l.lesson_sections)
      ? (l.lesson_sections[0] as any)?.count ?? 0
      : 0,
    teacher: l.creator ? {
      id: l.creator.id,
      name: l.creator.full_name,
    } : null,
  }))

  // Signed URL for subject image
  let imageUrl: string | null = null
  if (subject.image_path) {
    const { data: signedData } = await supabase.storage
      .from('lesson-media')
      .createSignedUrl(subject.image_path, 3600 * 24)
    imageUrl = signedData?.signedUrl ?? null
  }

  return (
    <div className="container-page py-6 sm:py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-4 flex-wrap">
        <Link href="/student" className="text-ink-secondary hover:text-accent transition-colors font-medium">
          لوحة الطالب
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-ink-muted" />
        <Link href="/student/subjects" className="text-ink-secondary hover:text-accent transition-colors font-medium">
          المواد الدراسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-ink-muted" />
        <span className="text-ink-primary font-medium">{subject.name}</span>
      </nav>

      {/* Subject Header Banner */}
      <div className="border border-border-base rounded-lg bg-bg-surface p-5 sm:p-6 mb-6 flex flex-col md:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-bg-alt border border-border-subtle flex items-center justify-center shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={subject.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-8 h-8 text-accent stroke-[1.5]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="chip text-[11px] font-semibold text-accent border-accent/20 bg-accent-bg">
                مقرر دراسي
              </span>
              <span className="text-xs text-ink-muted">· {lessons.length} دروس</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary mb-1">
              {subject.name}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              فهرس الدروس والمحتوى التعليمي المنشور لهذه المادة. اضغط على أي درس لبدء القراءة ومطالعة الأقسام والشروحات.
            </p>
          </div>
        </div>

        <Link
          href="/student/subjects"
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0 self-end sm:self-center"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>كل المواد</span>
        </Link>
      </div>

      {/* Lessons Explorer with Teacher Filter and Search */}
      <SubjectLessonsExplorer lessons={lessons} subjectName={subject.name} />
    </div>
  )
}
