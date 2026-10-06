import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
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
  Pencil,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, subject:subjects(name)')
    .eq('id', id)
    .single()
  const subjectName = (lesson?.subject as any)?.name
  const title = lesson?.title
    ? subjectName
      ? `${lesson.title} - ${subjectName}`
      : lesson.title
    : 'معاينة الدرس'
  return {
    title,
  }
}

export default async function TeacherLessonViewPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const { user, profile, supabase } = await requireRole('teacher')

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

  // Ensure the teacher owns this lesson (or is admin)
  if (lesson.created_by !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      notFound()
    }
  }

  // Fetch sections of this lesson ordered by sort_order
  const { data: rawSections } = await supabase
    .from('lesson_sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true })

  // Generate signed URLs in parallel for section images, PDFs, and videos
  const sections = await Promise.all(
    (rawSections ?? []).map(async (sec) => {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null
      let videoUrl: string | null = null

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

      if (sec.video_path) {
        const { data: signedVideo } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.video_path, 3600 * 24)
        videoUrl = signedVideo?.signedUrl ?? null
      }

      return {
        ...sec,
        imageUrl,
        pdfUrl,
        videoUrl,
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
  const teacherName = (lesson.creator as any)?.full_name

  return (
    <div className="container-page py-6 sm:py-8 max-w-[840px] animate-fade-in">
      {/* Teacher Preview Banner */}
      <div className="mb-6 p-4 rounded-lg bg-accent-bg border border-accent/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-ink-primary">
              معاينة الدرس (كما يظهر للطلاب)
            </p>
            <p className="text-xs text-ink-secondary">
              هذه الصفحة تعرض المظهر النهائي للدرس الذي يشاهده الطالب عند دراسته للمادة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link
            href={`/teacher/lessons/${lesson.id}/edit`}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>تعديل هذا الدرس</span>
          </Link>
          <Link
            href="/teacher/lessons"
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>قائمة الدروس</span>
          </Link>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-5 flex-wrap">
        <Link href="/teacher" className="text-ink-secondary hover:text-accent transition-colors font-medium">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-3 h-3 rotate-180 text-ink-muted" />
        <Link href="/teacher/lessons" className="text-ink-secondary hover:text-accent transition-colors font-medium">
          دروسي التعليمية
        </Link>
        <ChevronRight className="w-3 h-3 rotate-180 text-ink-muted" />
        <span className="text-ink-primary font-medium truncate max-w-xs">{lesson.title}</span>
      </nav>

      {/* Lesson Typographic Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip text-[11px] font-semibold text-accent border-accent/20 bg-accent-bg">
              {subjectName}
            </span>

            {teacherName && (
              <span className="chip text-[11px] text-ink-secondary">
                إعداد المعلم: أ. {teacherName}
              </span>
            )}
          </div>

          <span className="text-xs text-ink-muted font-mono">
            الترتيب: {lesson.sort_order}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary mb-4 leading-tight tracking-tight">
          {lesson.title}
        </h1>

        {/* Lesson Intro / Explanation in Editorial Highlight Callout */}
        {lesson.explanation && (
          <div className="p-4 sm:p-5 rounded-md border-r-2 border-accent bg-bg-alt/70 text-sm sm:text-base text-ink-primary leading-relaxed whitespace-pre-line font-serif italic">
            <p className="font-sans font-semibold text-[11px] text-ink-muted mb-1 not-italic">تمهيد ومقدمة الدرس:</p>
            {lesson.explanation}
          </div>
        )}
      </header>

      {/* Sections in Pure Typographic Flow - NO Card Container */}
      <article className="prose-lesson mb-12">
        {/* Dynamic Sections in Seamless Editorial Flow */}
        {sections.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className={index === 0 ? 'pb-8' : 'py-8'}
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-md bg-accent-bg text-accent font-serif font-bold text-xs flex items-center justify-center border border-accent/20 shrink-0">
                    {section.sort_order || index + 1}
                  </span>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary m-0">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="prose-lesson text-[15px] sm:text-base text-ink-primary leading-relaxed whitespace-pre-line mb-6">
                  {section.content}
                </div>

                {/* Optional Media: Video */}
                {section.videoUrl && (
                  <div className="my-5 rounded-lg overflow-hidden border border-border-base bg-black shadow-xs">
                    <video
                      src={section.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[480px] object-contain bg-black mx-auto"
                    />
                  </div>
                )}

                {/* Optional Media: Image */}
                {section.imageUrl && (
                  <figure className="my-5">
                    <div className="rounded-lg overflow-hidden border border-border-base bg-bg-alt">
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full max-h-96 object-contain mx-auto"
                      />
                    </div>
                  </figure>
                )}

                {/* Optional Media: PDF */}
                {section.pdfUrl && (
                  <div className="my-4 p-4 rounded-md border border-border-base bg-bg-alt/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-error-bg text-error flex items-center justify-center shrink-0 border border-error/20">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-ink-primary">
                          ملف توضيحي مرفق (PDF)
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          يمكن للطالب قراءة الملف أو تحميله للمراجعة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <a
                        href={section.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </a>
                      <a
                        href={section.pdfUrl}
                        download
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </a>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-ink-muted">
            <p className="text-sm mb-3">لا توجد أقسام تفصيلية في هذا الدرس بعد.</p>
            <Link
              href={`/teacher/lessons/${lesson.id}/edit`}
              className="text-xs text-accent hover:underline font-bold"
            >
              + إضافة أقسام تفصيلية الآن
            </Link>
          </div>
        )}
      </article>

      {/* Lesson Questions & Discussions Section */}
      <LessonQuestionsSection
        lessonId={lessonId}
        lessonTitle={lesson.title}
        initialQuestions={questions}
        currentUserId={user.id}
        currentUserRole={profile.role}
      />

      {/* Footer Navigation */}
      <div className="pt-8 mt-8 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/teacher/lessons"
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة جميع الدروس</span>
        </Link>

        <Link
          href={`/teacher/lessons/${lesson.id}/edit`}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          <span>تعديل هذا الدرس</span>
        </Link>
      </div>
    </div>
  )
}
