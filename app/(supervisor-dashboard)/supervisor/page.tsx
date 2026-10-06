import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  ArrowLeft,
  UserCheck,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'لوحة تحكم المشرف التربوي',
  description: 'متابعة المناهج والدروس والمساهمات والمقترحات التربوية في المنصة',
}

export default async function SupervisorPage() {
  const { supabase } = await requireRole('supervisor')

  const { count: subjectsCount } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  const statCards = [
    { icon: BookOpen, label: 'المواد الدراسية', value: String(subjectsCount ?? 0), color: 'text-amber-700 bg-amber-500/10' },
    { icon: GraduationCap, label: 'إجمالي الدروس', value: String(lessonsCount ?? 0), color: 'text-teal bg-teal/10' },
    { icon: Users, label: 'المحتوى المعتمد', value: '100%', color: 'text-ink-700 bg-ink-100/70' },
    { icon: ShieldCheck, label: 'صلاحية التدقيق', value: 'نشطة', color: 'text-teal bg-teal/10' },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 sm:p-8 mb-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-ink-900">لوحة المشرف التربوي</h1>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">مراجعة المحتوى والتدقيق الأكاديمي وإدارة المواد والمقررات</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="rounded-lg border border-ink-200/80 bg-paper-light p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif font-bold text-2xl text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Subjects Card */}
        <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 flex flex-col justify-between shadow-xs hover:border-teal/50 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-900">إدارة المواد الدراسية</h2>
                <p className="text-xs text-ink-500">إنشاء وتعديل وحذف المقررات التعليمية</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              بصفتك مشرفاً تربوياً، يمكنك تنظيم المناهج الدراسية وإضافة المواد الجديدة وتحديد أغلفتها لتمكين المعلمين من إنشاء الدروس وربطها بها.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-800 border border-amber-600/20">إشراف وتدقيق</span>
            <Link
              href="/supervisor/subjects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs"
            >
              <span>إدارة المواد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 flex flex-col justify-between shadow-xs hover:border-ink-300 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-900">الملف الشخصي للمشرف</h2>
                <p className="text-xs text-ink-500">إدارة معلومات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              يمكنك تحديث بياناتك الشخصية والتأكد من بيانات الاعتماد الإشرافية المسجلة في منصة مِداد التعليمية.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-ink-100 text-ink-700">صلاحية مشرف تربوي</span>
            <Link
              href="/supervisor/profile"
              className="btn-outline text-xs sm:text-sm py-2 px-4 rounded-md flex items-center gap-2"
            >
              <span>الملف الشخصي</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}