import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  Users,
  MessageSquare,
  ArrowLeft,
  UserCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StudentPage() {
  await requireRole('student')

  const statCards = [
    { icon: BookOpen, label: 'المواد المسجلة', value: '6', color: 'text-ink-700 bg-ink-100/70' },
    { icon: Bookmark, label: 'الموارد المحفوظة', value: '14', color: 'text-gold-dark bg-gold/15' },
    { icon: Users, label: 'معلمون أتابعهم', value: '5', color: 'text-sage-dark bg-sage-50' },
    { icon: MessageSquare, label: 'استفساراتي', value: '3', color: 'text-ink-800 bg-ink-200/60' },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shadow-soft">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">لوحة الطالب</h1>
          <p className="text-sm text-ink-500">الوصول السريع لمحتواك التعليمي ومتابعة المعلمين</p>
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">ملفي الشخصي</h2>
                <p className="text-xs text-ink-500">إدارة معلومات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              يمكنك تحديث بياناتك الشخصية وتغيير كلمة المرور الخاصة بحسابك في منصة مِداد التعليمية.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-sage-50 text-sage-dark text-xs">حساب طالب</span>
            <Link
              href="/student/profile"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>الملف الشخصي</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-ink-100 text-ink-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">المواد الدراسية</h2>
                <p className="text-xs text-ink-500">تصفح المناهج والملخصات والدروس</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              استكشف المواد الدراسية والملفات التعليمية المتاحة وتواصل مع نخبة من أفضل المعلمين.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="text-xs text-ink-500">المنهج اليمني الشامل</span>
            <span className="chip bg-gold/15 text-gold-dark text-xs font-semibold">متاح الآن</span>
          </div>
        </div>
      </div>
    </div>
  )
}