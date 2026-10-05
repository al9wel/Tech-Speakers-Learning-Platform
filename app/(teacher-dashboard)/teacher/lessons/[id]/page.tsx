import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
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
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TeacherLessonViewPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const { user, supabase } = await requireRole('teacher')

  // Fetch lesson with subject
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      *,
      subject:subjects (
        id,
        name
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

  const subjectName = (lesson.subject as any)?.name ?? 'المادة الدراسية'

  return (
    <div className="container-page py-8 animate-page max-w-4xl mx-auto">
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
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{subjectName}</span>
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

                {/* Optional Media: Image */}
                {section.imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-ink-100 bg-cream/20">
                    <img
                      src={section.imageUrl}
                      alt={section.title}
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
                          يمكن للطالب قراءة الملف أو تحميله للمراجعة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={section.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
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
