import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { BookOpen, ArrowRight, Layers, ArrowLeft, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المواد الدراسية',
  description: 'استكشف المناهج والمواد الدراسية وتصفح الدروس التعليمية المقررة',
}

export default async function StudentSubjectsPage() {
  const { supabase } = await requireRole('student')

  // Fetch all subjects with lesson counts
  const { data: rawSubjects, error } = await supabase
    .from('subjects')
    .select(`
      *,
      lessons (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="container-page py-12 animate-fade-in">
        <div className="border border-border-base rounded-lg p-8 bg-bg-surface text-center max-w-lg mx-auto">
          <h2 className="font-serif font-bold text-xl text-ink-primary mb-2">
            حدث خطأ أثناء تحميل المواد الدراسية
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary mb-5">
            {error.message || 'تعذر جلب قائمة المواد من قاعدة البيانات.'}
          </p>
          <Link href="/student" className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للوحة الطالب</span>
          </Link>
        </div>
      </div>
    )
  }

  // Generate signed URLs in parallel for images
  const subjectsWithImages = await Promise.all(
    (rawSubjects ?? []).map(async (s) => {
      let imageUrl: string | null = null
      if (s.image_path) {
        const { data: signedData } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(s.image_path, 3600 * 24)
        imageUrl = signedData?.signedUrl ?? null
      }

      const lessonCount = Array.isArray(s.lessons)
        ? (s.lessons[0] as any)?.count ?? 0
        : 0

      return {
        ...s,
        imageUrl,
        lessonCount,
      }
    })
  )

  const totalLessons = subjectsWithImages.reduce((acc, s) => acc + (s.lessonCount || 0), 0)

  return (
    <div className="container-page py-6 sm:py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-4 flex-wrap">
        <Link href="/student" className="text-ink-secondary hover:text-accent transition-colors font-medium">
          لوحة الطالب
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-ink-muted" />
        <span className="text-ink-primary font-medium">المواد الدراسية</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary">
            المواد الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            المنهج الكامل المعتمد، منظم حسب المادة والمقررات الدراسية
          </p>
        </div>

        <Link
          href="/student"
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>لوحة الطالب</span>
        </Link>
      </div>

      {/* Editorial Metrics Strip */}
      <div className="flex items-center gap-6 py-3.5 px-5 mb-6 border border-border-base rounded-lg bg-bg-surface overflow-x-auto no-scrollbar">
        <div>
          <div className="text-[11px] text-ink-muted font-medium">المواد المقررة</div>
          <div className="font-serif text-2xl font-bold text-ink-primary">{subjectsWithImages.length}</div>
        </div>
        <div className="h-8 w-px bg-border-subtle shrink-0" />
        <div>
          <div className="text-[11px] text-ink-muted font-medium">إجمالي الدروس</div>
          <div className="font-serif text-2xl font-bold text-ink-primary">{totalLessons}</div>
        </div>
        <div className="h-8 w-px bg-border-subtle shrink-0" />
        <div>
          <div className="text-[11px] text-ink-muted font-medium">حالة المناهج</div>
          <div className="font-serif text-base sm:text-lg font-bold text-accent mt-0.5">معتمدة رسمياً</div>
        </div>
      </div>

      {/* Grid of Subjects */}
      {subjectsWithImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectsWithImages.map((subject) => (
            <Link
              key={subject.id}
              href={`/student/subjects/${subject.id}`}
              className="border border-border-base rounded-lg bg-bg-surface overflow-hidden flex flex-col group hover:border-[#c8c4bc] hover:shadow-[0_2px_8px_rgba(28,27,25,0.04)] transition-all"
            >
              {/* Cover Image */}
              <div className="h-40 w-full bg-bg-alt relative overflow-hidden flex items-center justify-center border-b border-border-subtle">
                {subject.imageUrl ? (
                  <img
                    src={subject.imageUrl}
                    alt={subject.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-ink-muted gap-1.5">
                    <BookOpen className="w-8 h-8 stroke-[1.4] text-accent" />
                    <span className="text-[11px]">مقرر دراسي</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-bg-surface/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium text-ink-primary border border-border-subtle flex items-center gap-1 shadow-2xs">
                  <Layers className="w-3 h-3 text-accent" />
                  <span>{subject.lessonCount} درس</span>
                </div>
              </div>

              {/* Subject Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink-primary mb-1 group-hover:text-accent transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    مادة دراسية معتمدة ضمن المنهج اليمني الشامل
                  </p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-border-subtle flex items-center justify-between text-xs font-medium text-accent">
                  <span>تصفح فهرس الدروس</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-base rounded-lg p-10 text-center max-w-md mx-auto bg-bg-surface">
          <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-muted flex items-center justify-center mx-auto mb-3 border border-border-subtle">
            <BookOpen className="w-5 h-5 stroke-[1.6]" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-ink-primary mb-1">
            لا توجد مواد دراسية حالياً
          </h3>
          <p className="text-xs text-ink-secondary">
            سيتم إضافة المواد والمناهج الدراسية قريباً من قبل المشرفين التربويين.
          </p>
        </div>
      )}
    </div>
  )
}
