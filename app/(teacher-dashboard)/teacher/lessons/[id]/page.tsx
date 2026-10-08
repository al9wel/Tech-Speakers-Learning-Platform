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
  Pencil,
  Sparkles,
  GraduationCap,
  Presentation,
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
      ? `${lesson.title} - ${subjectName}`
      : lesson.title
    : 'معاينة الدرس'
  return {
    title,
  }
}

export default async function TeacherLessonViewPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const [{ user, profile, supabase }, { data: lesson, error: lessonError }] = await Promise.all([
    requireRole('teacher'),
    getLesson(lessonId),
  ])

  if (lessonError || !lesson) {
    notFound()
  }

  // Ensure the teacher owns this lesson (or is admin)
  if (lesson.created_by !== user.id && profile?.role !== 'admin') {
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

  // Generate signed URLs in parallel for main lesson media and all section media
  const [
    [signedLessonImg, signedLessonPdf, signedLessonVideo],
    sections,
  ] = await Promise.all([
    Promise.all([
      lesson.image_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.image_path, 3600 * 24)
        : Promise.resolve({ data: null }),
      lesson.pdf_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.pdf_path, 3600 * 24)
        : Promise.resolve({ data: null }),
      lesson.video_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.video_path, 3600 * 24)
        : Promise.resolve({ data: null }),
    ]),
    Promise.all(
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
    ),
  ])

  const lessonImageUrl = signedLessonImg.data?.signedUrl ?? null
  const lessonPdfUrl = signedLessonPdf.data?.signedUrl ?? null
  const lessonVideoUrl = signedLessonVideo.data?.signedUrl ?? null
  const isLessonPpt = Boolean(
    lesson.pdf_path &&
      (lesson.pdf_path.toLowerCase().endsWith('.ppt') ||
        lesson.pdf_path.toLowerCase().endsWith('.pptx'))
  )

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
    <div className="container-page py-8 animate-page">
      {/* Teacher Preview Banner */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gold/10 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-heading font-bold text-xs sm:text-sm text-ink-900">
              معاينة الدرس (كما يظهر للطلاب)
            </p>
            <p className="text-[11px] text-ink-600">
              هذه الصفحة تعرض المظهر النهائي للدرس الذي يشاهده الطالب عند دراسته للمادة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link
            href={`/teacher/lessons/${lesson.id}/edit`}
            className="btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-soft"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>تعديل هذا الدرس</span>
          </Link>
          <Link
            href="/teacher/lessons"
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-ink-50 bg-white"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>قائمة الدروس</span>
          </Link>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6 flex-wrap">
        <Link href="/teacher" className="hover:text-ink-900 transition">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-ink-300" />
        <Link href="/teacher/lessons" className="hover:text-ink-900 transition">
          دروسي التعليمية
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

        {/* Main Lesson Media Attachments */}
        {(lessonVideoUrl || lessonImageUrl || lessonPdfUrl) && (
          <div className="mt-5 pt-5 border-t border-ink-100 space-y-4">
            {lessonVideoUrl && (
              <div className="rounded-2xl overflow-hidden border border-ink-200/80 bg-ink-950 shadow-inner">
                <video
                  src={lessonVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[480px] object-contain bg-black mx-auto"
                />
              </div>
            )}

            {lessonImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-ink-100 bg-cream/20 flex justify-center">
                <Image
                  src={lessonImageUrl}
                  alt={lesson.title}
                  width={800}
                  height={450}
                  loading="lazy"
                  className="w-full max-h-96 object-contain mx-auto"
                />
              </div>
            )}

            {lessonPdfUrl && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isLessonPpt
                  ? 'bg-orange-50/50 border-orange-200/80'
                  : 'bg-cream/30 border-ink-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs ${
                    isLessonPpt
                      ? 'bg-orange-600 text-white border-orange-700'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {isLessonPpt ? (
                      <Presentation className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-ink-900">
                      {isLessonPpt ? 'عرض تقديمي مرفق بالدرس (PowerPoint)' : 'ملف تمهيدي مرفق (PDF)'}
                    </p>
                    <p className={`text-[11px] ${isLessonPpt ? 'text-orange-700 font-medium' : 'text-ink-500'}`}>
                      {isLessonPpt
                        ? 'عرض توضيحي أعدّه المعلم لهذا الدرس، يمكن للطلاب تحميله ومتابعته'
                        : 'يمكن للطالب قراءة الملف أو تحميله للمراجعة دون اتصال'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isLessonPpt && (
                    <a
                      href={lessonPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح في تبويب</span>
                    </a>
                  )}
                  <a
                    href={lessonPdfUrl}
                    download
                    className={`${isLessonPpt ? 'btn-primary bg-orange-600 hover:bg-orange-700 text-white' : 'btn-primary'} text-xs py-1.5 px-3 flex items-center gap-1.5`}
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{isLessonPpt ? 'تحميل العرض التقديمي' : 'تحميل الملف'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Sections Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold-dark" />
            <h2 className="font-heading font-bold text-lg text-ink-900">
              محتوى وأقسام الدرس ({sections.length})
            </h2>
          </div>

          {sections.length === 0 && (
            <Link
              href={`/teacher/lessons/${lesson.id}/edit`}
              className="text-xs text-gold-dark hover:underline font-bold"
            >
              + إضافة أقسام تفصيلية
            </Link>
          )}
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

                {/* Optional Media: PDF / PowerPoint */}
                {section.pdfUrl && (() => {
                  const isSecPpt = Boolean(
                    section.pdf_path &&
                      (section.pdf_path.toLowerCase().endsWith('.ppt') ||
                        section.pdf_path.toLowerCase().endsWith('.pptx'))
                  )
                  return (
                    <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSecPpt
                        ? 'bg-orange-50/50 border-orange-200/80'
                        : 'bg-cream/30 border-ink-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs ${
                          isSecPpt
                            ? 'bg-orange-600 text-white border-orange-700'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {isSecPpt ? (
                            <Presentation className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-ink-900">
                            {isSecPpt ? 'عرض تقديمي مرفق بالقسم (PowerPoint)' : 'ملف توضيحي مرفق (PDF)'}
                          </p>
                          <p className={`text-[11px] ${isSecPpt ? 'text-orange-700 font-medium' : 'text-ink-500'}`}>
                            {isSecPpt
                              ? 'عرض توضيحي مرفق بهذا القسم يمكن للطلاب تحميله ومتابعته'
                              : 'يمكن للطالب قراءة الملف أو تحميله للمراجعة'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isSecPpt && (
                          <a
                            href={section.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>فتح في تبويب</span>
                          </a>
                        )}
                        <a
                          href={section.pdfUrl}
                          download
                          className={`${isSecPpt ? 'btn-primary bg-orange-600 hover:bg-orange-700 text-white' : 'btn-primary'} text-xs py-1.5 px-3 flex items-center gap-1.5`}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>{isSecPpt ? 'تحميل العرض التقديمي' : 'تحميل الملف'}</span>
                        </a>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 bg-cream/30 border-dashed border-2 border-ink-200 text-center rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-ink-800 mb-1">
              لا توجد أقسام فرعية لهذا الدرس
            </h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto mb-4 leading-relaxed">
              تم إنشاء هذا الدرس بالشرح التمهيدي فقط. بإمكانك إضافة أقسام تفاعلية في أي وقت عبر زر التعديل.
            </p>
            <Link
              href={`/teacher/lessons/${lesson.id}/edit`}
              className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-2 hover:bg-gold/10 hover:border-gold bg-white"
            >
              <Pencil className="w-3.5 h-3.5 text-gold-dark" />
              <span>إضافة أقسام للدرس الآن</span>
            </Link>
          </div>
        )}
      </div>

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
          className="btn-gold text-sm flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          <span>تعديل هذا الدرس</span>
        </Link>
      </div>
    </div>
  )
}
