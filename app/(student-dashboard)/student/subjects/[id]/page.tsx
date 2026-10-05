import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { BookOpen, ArrowRight, ArrowLeft, FileText, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
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

  // Fetch all lessons for this subject
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      *,
      lesson_sections (count)
    `)
    .eq('subject_id', subjectId)
    .order('sort_order', { ascending: true })

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
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-cream/60 border border-ink-100 flex items-center justify-center shrink-0 shadow-soft">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={subject.name}
              className="w-full h-full object-cover"
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

      {/* Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading font-bold text-lg text-ink-900">
            دروس المادة ({lessons?.length ?? 0})
          </h2>
          <span className="text-xs text-ink-400">مرتبة حسب التسلسل المعتمد</span>
        </div>

        {lessons && lessons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {lessons.map((lesson, index) => {
              const sectionsCount = Array.isArray(lesson.lesson_sections)
                ? (lesson.lesson_sections[0] as any)?.count ?? 0
                : 0

              return (
                <Link
                  key={lesson.id}
                  href={`/student/lessons/${lesson.id}`}
                  className="card p-5 sm:p-6 card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border-ink-100 hover:border-gold transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-heading font-bold text-sm shrink-0 mt-0.5">
                      {lesson.sort_order || index + 1}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-ink-900 group-hover:text-gold-dark transition-colors mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">
                        {lesson.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-50 text-ink-600 text-xs font-medium">
                      <FileText className="w-3.5 h-3.5 text-ink-400" />
                      <span>{sectionsCount} أقسام</span>
                    </span>

                    <span className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 group-hover:bg-gold-dark">
                      <span>عرض الدرس</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="card p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-ink-300 stroke-1 mx-auto mb-2" />
            <h3 className="font-heading font-bold text-base text-ink-900 mb-1">
              لا توجد دروس منشورة في هذه المادة بعد
            </h3>
            <p className="text-xs text-ink-500">
              يقوم المعلمون حالياً بإعداد المحتوى التعليمي وسيتم نشره قريباً.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
