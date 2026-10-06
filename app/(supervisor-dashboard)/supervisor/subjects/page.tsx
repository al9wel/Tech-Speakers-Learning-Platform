import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { SubjectsTable } from '@/features/subjects/components/SubjectsTable'
import type { SubjectItem } from '@/features/subjects/types'
import { BookOpen, ArrowRight, AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'إدارة المواد الدراسية',
  description: 'إضافة وتعديل وحذف المواد والمناهج الدراسية في المنصة',
}

export default async function SupervisorSubjectsPage() {
  const { user, supabase } = await requireRole('supervisor')

  // Fetch all subjects for supervisor management
  const { data: rawSubjects, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="container-page py-12 animate-page">
        <div className="card p-8 bg-white border-red-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            حدث خطأ أثناء تحميل المواد
          </h2>
          <p className="text-sm text-ink-500 mb-5 leading-relaxed">
            {error.message || 'تعذر جلب قائمة المواد من قاعدة البيانات.'}
          </p>
          <Link href="/supervisor" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة الإشراف</span>
          </Link>
        </div>
      </div>
    )
  }

  // Generate signed URLs in parallel for images stored in the private bucket
  const subjects: SubjectItem[] = await Promise.all(
    (rawSubjects ?? []).map(async (s) => {
      let imageUrl: string | null = null
      if (s.image_path) {
        const { data: signedData } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(s.image_path, 3600 * 24)
        imageUrl = signedData?.signedUrl ?? null
      }

      return {
        id: s.id,
        name: s.name,
        created_by: s.created_by,
        image_path: s.image_path,
        imageUrl,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }
    })
  )

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark border border-gold/30 flex items-center justify-center shrink-0 shadow-soft">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة المواد الدراسية
            </h1>
            <p className="text-sm text-ink-500">
              إنشاء وإدارة المقررات التعليمية المتاحة في المنصة
            </p>
          </div>
        </div>

        <Link
          href="/supervisor"
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة الإشراف</span>
        </Link>
      </div>

      {/* TanStack Table for Subjects (Manage Mode) */}
      <SubjectsTable data={subjects} currentUserId={user.id} canManage={true} />
    </div>
  )
}
