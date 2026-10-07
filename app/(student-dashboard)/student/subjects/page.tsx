import Link from 'next/link'
import Image from 'next/image'
import { requireRole } from '@/lib/auth/require-role'
import { BookOpen, ArrowRight, Layers, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

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
      <div className="container-page py-12 animate-page">
        <div className="card p-8 bg-white border-red-200 text-center max-w-lg mx-auto">
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            حدث خطأ أثناء تحميل المواد الدراسية
          </h2>
          <p className="text-sm text-ink-500 mb-5">
            {error.message || 'تعذر جلب قائمة المواد من قاعدة البيانات.'}
          </p>
          <Link href="/student" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
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

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark border border-gold/30 flex items-center justify-center shrink-0 shadow-soft">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              المواد الدراسية
            </h1>
            <p className="text-sm text-ink-500">
              استكشف المناهج التعليمية وتصفح الدروس والملخصات المتاحة
            </p>
          </div>
        </div>

        <Link
          href="/student"
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الطالب</span>
        </Link>
      </div>

      {/* Grid of Subjects */}
      {subjectsWithImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsWithImages.map((subject) => (
            <Link
              key={subject.id}
              href={`/student/subjects/${subject.id}`}
              className="card card-hover overflow-hidden flex flex-col group border-ink-100 hover:border-gold transition-all"
            >
              {/* Cover Image */}
              <div className="h-44 w-full bg-cream/60 relative overflow-hidden flex items-center justify-center border-b border-ink-100/60">
                {subject.imageUrl ? (
                  <Image
                    src={subject.imageUrl}
                    alt={subject.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gold-dark gap-2">
                    <BookOpen className="w-10 h-10 stroke-1" />
                    <span className="text-xs text-ink-400">مقرر دراسي</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-ink-800 shadow-soft flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gold-dark" />
                  <span>{subject.lessonCount} درس</span>
                </div>
              </div>

              {/* Subject Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink-900 mb-1 group-hover:text-gold-dark transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-ink-500">
                    مادة دراسية معتمدة ضمن المنهج اليمني الشامل
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-ink-100/60 flex items-center justify-between text-xs font-bold text-gold-dark">
                  <span>تصفح الدروس</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-ink-900 mb-1">
            لا توجد مواد دراسية حالياً
          </h3>
          <p className="text-xs text-ink-500">
            سيتم إضافة المواد والمناهج الدراسية قريباً من قبل المشرفين التربويين.
          </p>
        </div>
      )}
    </div>
  )
}
