import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import {
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  ArrowLeft,
  UserCheck,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'لوحة تحكم المعلم',
  description: 'إدارة الدروس التعليمية والمحتوى الدراسي ومتابعة استفسارات الطلاب',
}

export default async function TeacherPage() {
  const { user, supabase } = await requireRole('teacher')

  // Count lessons created by this teacher
  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  const statCards = [
    {
      icon: BookOpen,
      label: 'دروسي المنشورة',
      value: String(lessonsCount ?? 0),
      color: 'text-ink-700 bg-ink-100/70',
      href: '/teacher/lessons',
    },
    { icon: FileText, label: 'أقسام تفاعلية', value: 'نشطة', color: 'text-gold-dark bg-gold/15' },
    { icon: MessageSquare, label: 'تفاعل الطلاب', value: 'متاح', color: 'text-sage-dark bg-sage-50' },
    { icon: Users, label: 'صلاحية المعلم', value: 'معتمد', color: 'text-ink-800 bg-ink-200/60' },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shadow-soft">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">واجهة المعلم</h1>
          <p className="text-sm text-ink-500">إدارة الدروس والمحتوى التعليمي وإرفاق الشروحات والملفات</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          const content = (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {card.href && (
                  <ArrowLeft className="w-3.5 h-3.5 text-ink-400 group-hover:-translate-x-1 transition-transform" />
                )}
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{card.label}</p>
            </>
          )

          return card.href ? (
            <Link key={i} href={card.href} className="card p-5 card-hover block group">
              {content}
            </Link>
          ) : (
            <div key={i} className="card p-5">
              {content}
            </div>
          )
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Lessons Card */}
        <div className="card p-6 card-hover flex flex-col justify-between border-gold/30">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">إدارة الدروس التعليمية</h2>
                <p className="text-xs text-ink-500">إنشاء وتعديل ونشر الدروس لطلابك</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              قم باختيار المادة الدراسية المعتمدة، ثم أضف شروحات الدروس وقسمها إلى أجزاء ديناميكية مع إرفاق الصور التوضيحية أو مستندات PDF.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="text-xs text-ink-500">
              عدد دروسك: <strong className="text-ink-900">{lessonsCount ?? 0} درس</strong>
            </span>
            <Link
              href="/teacher/lessons"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>إدارة دروسي</span>
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
                <h2 className="font-heading font-bold text-lg text-ink-900">الملف الشخصي للمعلم</h2>
                <p className="text-xs text-ink-500">تحديث المعلومات الشخصية وكلمة المرور</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              إدارة بيانات حسابك التعليمي والتأكد من صحة البريد الإلكتروني وكلمة المرور المسجلة في منصة مِداد.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-gold/20 text-gold-dark text-xs">حساب معلم معتمد</span>
            <Link
              href="/teacher/profile"
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