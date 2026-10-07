import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { LessonForm } from '@/features/lessons/components/LessonForm'
import { ArrowRight, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إضافة درس جديد',
  description: 'إنشاء درس تعليمي جديد وإضافة الأقسام والوسائط التوضيحية',
}

export default async function NewLessonPage() {
  const { user, supabase } = await requireRole('teacher')

  // Fetch ALL subjects from the catalog (not filtered by teacher)
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  if (error || !subjects || subjects.length === 0) {
    return (
      <div className="container-page py-12 animate-page">
        <div className="card p-8 bg-white border-gold/30 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            لا توجد مواد دراسية مسجلة حالياً
          </h2>
          <p className="text-sm text-ink-500 mb-6 leading-relaxed">
            يجب أولاً أن يقوم المشرف التربوي بإضافة المواد الدراسية في النظام حتى تتمكن من إنشاء وربط الدروس بها.
          </p>
          <Link href="/teacher/lessons" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الدروس</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-8 animate-page max-w-4xl mx-auto">
      <LessonForm subjects={subjects} currentUserId={user.id} />
    </div>
  )
}
