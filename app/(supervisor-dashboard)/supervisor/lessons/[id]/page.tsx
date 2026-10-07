import Link from 'next/link'
import Image from 'next/image'
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
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { cache } from 'react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

const getLesson = cache(async (lessonId: string) => {
  const supabase = await createClient()
  return await supabase
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
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data: lesson } = await getLesson(id)
  const subjectName = (lesson?.subject as any)?.name
  const title = lesson?.title
    ? subjectName
      ? `معاينة: ${lesson.title} (${subjectName})`
      : `معاينة: ${lesson.title}`
    : 'معاينة الدرس'
  return {
    title,
  }
}

export default async function SupervisorLessonViewPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const [{ user, supabase }, { data: lesson, error: lessonError }] = await Promise.all([
    requireRole('supervisor'),
    getLesson(lessonId),
  ])

  if (lessonError || !lesson) {
    notFound()
  }

  // Fetch sections and questions concurrently in parallel
  const [
    { data: rawSections },
    { data: rawQuestions },
  ] = await Promise.all([
    supabase
      .from('lesson_sections')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true }),
    supabase
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
      .order('created_at', { ascending: false }),
  ])

  // Generate signed URLs in parallel for all section media
  const sections = await Promise.all(
    (rawSections ?? []).map(async (sec) => {
      const [signedImg, signedPdf, signedVideo] = await Promise.all([
        sec.image_path
          ? supabase.storage.from('lesson-media').createSignedUrl(sec.image_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        sec.pdf_path
          ? supabase.storage.from('lesson-media').createSignedUrl(sec.pdf_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        sec.video_path
          ? supabase.storage.from('lesson-media').createSignedUrl(sec.video_path, 3600 * 24)
          : Promise.resolve({ data: null }),
      ])

      return {
        ...sec,
        imageUrl: signedImg.data?.signedUrl ?? null,
        pdfUrl: signedPdf.data?.signedUrl ?? null,
        videoUrl: signedVideo.data?.signedUrl ?? null,
      }
    })
  )

  const questions: QuestionItem[] = (rawQuestions ?? []).map((q: any) => ({
    id: q.id,
    lesson_id: q.lesson_id,
    created_by: q.created_by,
    title: q.title,
    content: q.content,
    created_at: q.created_at,
    updated_at: q.updated_at,
    author: q.author
      ? {
          id: q.author.id,
          full_name: q.author.full_name,
          role: q.author.role,
        }
      : undefined,
    answers: (q.question_answers ?? []).map((ans: any) => ({
      id: ans.id,
      question_id: ans.question_id,
      user_id: ans.user_id,
      content: ans.content,
      created_at: ans.created_at,
      updated_at: ans.updated_at,
      author: ans.author
        ? {
            id: ans.author.id,
            full_name: ans.author.full_name,
            role: ans.author.role,
          }
        : undefined,
    })),
    answersCount: (q.question_answers ?? []).length,
  }))

  const subjectName = (lesson.subject as any)?.name ?? 'المادة الدراسية'
  const teacherName = (lesson.creator as any)?.full_name

  return (
    <div className="container-page py-8 animate-page">
      {/* Supervisor Preview Banner */}
      <div className="mb-6 p-4 rounded-3xl bg-gold/10 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-ink-900">
              معاينة الدرس (لوحة الإشراف)
            </p>
            <p className="text-xs text-ink-600 font-medium">
              الاطلاع على كامل تفاصيل الدرس ومحتواه وأسئلته للتقييم والتوجيه التربوي.
            </p>
          </div>
        </div>

        <Link
          href="/supervisor/lessons"
          className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 hover:bg-ink-100 bg-white cursor-pointer shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للدروس</span>
        </Link>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6 flex-wrap">
        <Link href="/supervisor" className="hover:text-ink-900 transition">
          لوحة الإشراف
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <Link href="/supervisor/lessons" className="hover:text-ink-900 transition">
          الدروس
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <span className="text-ink-900 font-bold truncate max-w-xs">{lesson.title}</span>
      </nav>

      {/* Lesson Header Card */}
      <div className="card p-6 sm:p-8 bg-white border-ink-100 mb-8 shadow-card">
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

          <span className="text-xs text-ink-400 font-mono">
            الترتيب: {lesson.sort_order}
          </span>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-900 mb-4 leading-snug">
          {lesson.title}
        </h1>

        {/* Lesson Intro / Explanation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cream/40 border border-ink-100 text-sm text-ink-700 leading-relaxed whitespace-pre-line">
          <p className="font-bold text-xs text-ink-500 mb-1.5">مقدمة وتمهيد الدرس:</p>
          {lesson.explanation}
        </div>
      </div>

      {/* Dynamic Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold-dark" />
            <h2 className="font-heading font-bold text-lg text-ink-900">
              محتوى وأقسام الدرس ({sections.length})
            </h2>
          </div>
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

                {/* Optional Media: Video */}
                {section.videoUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-ink-200/80 bg-ink-950 shadow-inner">
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
                  <div className="mt-4 rounded-2xl overflow-hidden border border-ink-100 bg-cream/20 flex justify-center">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      width={800}
                      height={450}
                      loading="lazy"
                      className="w-full max-h-96 object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Optional Media: PDF */}
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
                          يمكن معاينة وقراءة الملف المرفق
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={section.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-ink-100 bg-white cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </a>
                      <a
                        href={section.pdfUrl}
                        download
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 bg-white text-center border-dashed border-ink-200">
            <p className="text-sm text-ink-500">لا توجد أقسام تفصيلية في هذا الدرس بعد.</p>
          </div>
        )}
      </div>

      {/* Lesson Questions & Discussion Section */}
      <div className="mt-12">
        <LessonQuestionsSection
          lessonId={lessonId}
          lessonTitle={lesson.title}
          initialQuestions={questions}
          currentUserId={user.id}
          currentUserRole="supervisor"
        />
      </div>
    </div>
  )
}
