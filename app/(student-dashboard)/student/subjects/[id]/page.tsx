import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
import { SubjectLessonsExplorer, type SubjectLessonItem } from '@/features/subjects/components/SubjectLessonsExplorer'
import { BookOpen, ArrowRight, ChevronRight } from 'lucide-react'
import { cache } from 'react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

const getSubject = cache(async (id: string) => {
  const supabase = await createClient()
  return await supabase.from('subjects').select('*').eq('id', id).single()
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data: subject } = await getSubject(id)
  return {
    title: subject?.name ? `مادة ${subject.name}` : 'تفاصيل المادة الدراسية',
  }
}

export default async function StudentSubjectLessonsPage({ params }: PageProps) {
  const { id: subjectId } = await params
  const [{ supabase }, { data: subject, error: subjectError }] = await Promise.all([
    requireRole('student'),
    getSubject(subjectId),
  ])

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
    <div className="container-page py-8 animate-page">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6">
        <Link href="/student" className="hover:text-ink-900 transition">
          لوحة الطالب
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <Link href="/student/subjects" className="hover:text-ink-900 transition">
          المواد الدراسية
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <span className="text-ink-900 font-bold">{subject.name}</span>
      </nav>

      {/* Subject Header Banner */}
      <div className="card p-6 sm:p-8 bg-white border-ink-100/80 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden bg-cream/60 border border-ink-100 flex items-center justify-center shrink-0 shadow-soft">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={subject.name}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-gold-dark" />
          )}
        </div>

        <div className="flex-1 text-center md:text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold mb-2">
            <span>مقرر دراسي</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-900 mb-2">
            {subject.name}
          </h1>
          <p className="text-sm text-ink-600 max-w-2xl leading-relaxed">
            قائمة الدروس والمحتوى التعليمي المنشور لهذه المادة. يمكنك الضغط على أي درس لبدء القراءة والاطلاع على الأقسام والملفات المرفقة.
          </p>
        </div>

        <Link
          href="/student/subjects"
          className="btn-outline text-xs flex items-center gap-1.5 shrink-0 self-center md:self-start hover:bg-ink-50"
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
