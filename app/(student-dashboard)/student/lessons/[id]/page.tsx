import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { LessonQuestionsSection } from '@/features/questions/components/LessonQuestionsSection'
import type { QuestionItem } from '@/features/questions/types'
import {
  BookOpen,
  ArrowRight,
  FileText,
  ChevronRight,
  FileDown,
  ExternalLink,
  Layers,
  GraduationCap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StudentLessonViewPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const { user, profile, supabase } = await requireRole('student')

  // Fetch lesson with subject and creator
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      *,
      subject:subjects (
        id,
        name
      ),
      creator:profiles!lessons_created_by_fkey (
        id,
        full_name,
        role
      )
    `)
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    notFound()
  }

  // Fetch sections of this lesson ordered by sort_order
  const { data: rawSections, error: sectionsError } = await supabase
    .from('lesson_sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true })

  // Generate signed URLs in parallel for section images and PDFs
  const sections = await Promise.all(
    (rawSections ?? []).map(async (sec) => {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null

      if (sec.image_path) {
        const { data: signedImg } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.image_path, 3600 * 24)
        imageUrl = signedImg?.signedUrl ?? null
      }

      if (sec.pdf_path) {
        const { data: signedPdf } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.pdf_path, 3600 * 24)
        pdfUrl = signedPdf?.signedUrl ?? null
      }

      return {
        ...sec,
        imageUrl,
        pdfUrl,
      }
    })
  )

  // Fetch questions for this lesson along with answers and authors
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select(`
      id,
      lesson_id,
      created_by,
      title,
      content,
      created_at,
      updated_at,
      author:profiles!questions_created_by_fkey (
        id,
        full_name,
        role
      ),
      question_answers (
        id,
        question_id,
        user_id,
        content,
        created_at,
        updated_at,
        author:profiles!question_answers_user_id_fkey (
          id,
          full_name,
          role
        )
      )
    `)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  const questions: QuestionItem[] = (rawQuestions ?? []).map((q: any) => ({
    id: q.id,
    lesson_id: q.lesson_id,
    created_by: q.created_by,
    title: q.title,
    content: q.content,
    created_at: q.created_at,
    updated_at: q.updated_at,
    author: q.author ? {
      id: q.author.id,
      full_name: q.author.full_name,
      role: q.author.role,
    } : undefined,
    answers: (q.question_answers ?? []).map((ans: any) => ({
      id: ans.id,
      question_id: ans.question_id,
      user_id: ans.user_id,
      content: ans.content,
      created_at: ans.created_at,
      updated_at: ans.updated_at,
      author: ans.author ? {
        id: ans.author.id,
        full_name: ans.author.full_name,
        role: ans.author.role,
      } : undefined,
    })),
    answersCount: (q.question_answers ?? []).length,
  }))

  const subjectName = (lesson.subject as any)?.name ?? 'المادة الدراسية'
  const subjectId = (lesson.subject as any)?.id
  const teacherName = (lesson.creator as any)?.full_name

  return (
    <div className="container-page py-8 animate-page">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6 flex-wrap">
        <Link href="/student" className="hover:text-ink-900 transition">
          لوحة الطالب
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <Link href="/student/subjects" className="hover:text-ink-900 transition">
          المواد الدراسية
        </Link>
        {subjectId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
            <Link
              href={`/student/subjects/${subjectId}`}
              className="hover:text-ink-900 transition"
            >
              {subjectName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <span className="text-ink-900 font-bold truncate max-w-xs">{lesson.title}</span>
      </nav>

      {/* Lesson Header Card */}
      <div className="card p-6 sm:p-8 bg-white border-ink-100 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subjectName}</span>
            </div>

            {teacherName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-100 text-ink-700 text-xs font-semibold border border-ink-200">
                <GraduationCap className="w-3.5 h-3.5 text-gold-dark" />
                <span>إعداد المعلم: أ. {teacherName}</span>
              </div>
            )}
          </div>

          {subjectId && (
            <Link
              href={`/student/subjects/${subjectId}`}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-ink-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>فهرس الدروس</span>
            </Link>
          )}
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-900 mb-4 leading-snug">
          {lesson.title}
        </h1>

        {/* Lesson Intro / Explanation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cream/40 border border-ink-100 text-sm text-ink-700 leading-relaxed whitespace-pre-line">
          <p className="font-bold text-xs text-ink-500 mb-1">مقدمة وتمهيد الدرس:</p>
          {lesson.explanation}
        </div>
      </div>

      {/* Dynamic Sections Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
          <Layers className="w-4 h-4 text-gold-dark" />
          <h2 className="font-heading font-bold text-lg text-ink-900">
            محتوى وأقسام الدرس ({sections.length})
          </h2>
        </div>

        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="card p-6 sm:p-7 bg-white border-ink-100/90 shadow-card"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center font-heading font-bold text-xs shrink-0">
                    {section.sort_order || index + 1}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-ink-900">
                    {section.title}
                  </h3>
                </div>

                {/* Section Content */}
                <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed whitespace-pre-line mb-6">
                  {section.content}
                </div>

                {/* Optional Media (Image OR PDF) */}
                {section.imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-ink-100 bg-cream/20">
                    <img
                      src={section.imageUrl}
                      alt={section.title}
                      className="w-full max-h-96 object-contain mx-auto"
                    />
                  </div>
                )}

                {section.pdfUrl && (
                  <div className="mt-4 p-4 rounded-2xl border border-ink-100 bg-cream/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-ink-900">
                          ملف توضيحي مرفق (PDF)
                        </p>
                        <p className="text-[11px] text-ink-500">
                          يمكنك قراءة الملف أو تحميله للمراجعة دون اتصال
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={section.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح في تبويب</span>
                      </a>
                      <a
                        href={section.pdfUrl}
                        download
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>تحميل الملف</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-400">
            <p className="text-xs">لا توجد أقسام تفصيلية في هذا الدرس بعد.</p>
          </div>
        )}
      </div>

      {/* Lesson Questions & Discussion Section */}
      <LessonQuestionsSection
        lessonId={lessonId}
        lessonTitle={lesson.title}
        initialQuestions={questions}
        currentUserId={user.id}
        currentUserRole={profile.role}
      />

      {/* Back to Subject Footer */}
      {subjectId && (
        <div className="pt-8 mt-8 border-t border-ink-100 flex justify-center">
          <Link
            href={`/student/subjects/${subjectId}`}
            className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة دروس {subjectName}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
