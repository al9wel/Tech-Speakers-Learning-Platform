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

export const dynamic = 'force-dynamic'

export default async function SupervisorPage() {
  const { supabase } = await requireRole('supervisor')

  const { count: subjectsCount } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  const statCards = [
    { icon: BookOpen, label: 'المواد الدراسية', value: String(subjectsCount ?? 0), color: 'text-gold-dark bg-gold/15' },
    { icon: GraduationCap, label: 'إجمالي الدروس', value: String(lessonsCount ?? 0), color: 'text-ink-700 bg-ink-100/70' },
    { icon: Users, label: 'المحتوى المعتمد', value: '100%', color: 'text-sage-dark bg-sage-50' },
    { icon: ShieldCheck, label: 'صلاحية التدقيق', value: 'نشطة', color: 'text-blue-800 bg-blue-50' },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shadow-soft">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">لوحة المشرف التربوي</h1>
          <p className="text-sm text-ink-500">مراجعة المحتوى والتدقيق الأكاديمي وإدارة المواد</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Subjects Card */}
        <div className="card p-6 card-hover flex flex-col justify-between border-gold/30">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">إدارة المواد الدراسية</h2>
                <p className="text-xs text-ink-500">إنشاء وتعديل وحذف المقررات التعليمية</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              بصفتك مشرفاً تربوياً، يمكنك تنظيم المناهج الدراسية وإضافة المواد الجديدة وتحديد أغلفتها لتمكين المعلمين من إنشاء الدروس وربطها بها.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-gold/15 text-gold-dark text-xs font-semibold">إدارة كاملة</span>
            <Link
              href="/supervisor/subjects"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>إدارة المواد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-ink-100 text-ink-700 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">الملف الشخصي للمشرف</h2>
                <p className="text-xs text-ink-500">إدارة معلومات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              يمكنك تحديث بياناتك الشخصية والتأكد من بيانات الاعتماد الإشرافية المسجلة في منصة مِداد التعليمية.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-blue-50 text-blue-800 text-xs">صلاحية مشرف تربوي</span>
            <Link
              href="/supervisor/profile"
              className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
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