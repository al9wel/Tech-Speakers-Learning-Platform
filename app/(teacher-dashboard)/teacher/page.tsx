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
      color: 'text-accent bg-accent/10 border-accent/20',
      href: '/teacher/lessons',
    },
    { icon: FileText, label: 'أقسام تفاعلية', value: 'نشطة', color: 'text-amber bg-amber/10 border-amber/20' },
    { icon: MessageSquare, label: 'تفاعل الطلاب', value: 'متاح', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60' },
    { icon: Users, label: 'صلاحية المعلم', value: 'معتمد', color: 'text-ink-secondary bg-bg-alt border-border-subtle' },
  ]

  return (
    <div className="container-page py-6 sm:py-8">
      {/* Header Panel */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink-primary">واجهة المعلم</h1>
            <p className="text-xs sm:text-sm text-ink-muted">إدارة الدروس والمحتوى التعليمي وإرفاق الشروحات والملفات</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          const content = (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.href && (
                  <ArrowLeft className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:-translate-x-1 transition-all" />
                )}
              </div>
              <p className="font-serif font-bold text-2xl text-ink-primary">{card.value}</p>
              <p className="text-xs text-ink-muted mt-0.5">{card.label}</p>
            </>
          )

          return card.href ? (
            <Link key={i} href={card.href} className="bg-bg-surface rounded-lg border border-border-base p-4 hover:border-accent/40 transition-colors block group shadow-xs">
              {content}
            </Link>
          ) : (
            <div key={i} className="bg-bg-surface rounded-lg border border-border-base p-4 shadow-xs">
              {content}
            </div>
          )
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Manage Lessons Card */}
        <div className="bg-bg-surface rounded-lg border border-border-base p-5 sm:p-6 hover:border-accent/40 transition-colors flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-primary">إدارة الدروس التعليمية</h2>
                <p className="text-xs text-ink-muted">إنشاء وتعديل ونشر الدروس لطلابك</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary mb-5 leading-relaxed font-normal">
              قم باختيار المادة الدراسية المعتمدة، ثم أضف شروحات الدروس وقسمها إلى أجزاء ديناميكية مع إرفاق الصور التوضيحية أو مستندات PDF.
            </p>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-ink-muted font-normal">
              عدد دروسك: <strong className="text-ink-primary font-semibold">{lessonsCount ?? 0} درس</strong>
            </span>
            <Link
              href="/teacher/lessons"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium shadow-xs transition-colors"
            >
              <span>إدارة دروسي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-bg-surface rounded-lg border border-border-base p-5 sm:p-6 hover:border-accent/40 transition-colors flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-secondary flex items-center justify-center border border-border-subtle">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-primary">الملف الشخصي للمعلم</h2>
                <p className="text-xs text-ink-muted">تحديث المعلومات الشخصية وكلمة المرور</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary mb-5 leading-relaxed font-normal">
              إدارة بيانات حسابك التعليمي والتأكد من صحة البريد الإلكتروني وكلمة المرور المسجلة في منصة مِداد.
            </p>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber/10 text-amber text-[11px] font-medium border border-amber/20">
              حساب معلم معتمد
            </span>
            <Link
              href="/teacher/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs font-medium text-ink-secondary transition-colors"
            >
              <span>الملف الشخصي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}