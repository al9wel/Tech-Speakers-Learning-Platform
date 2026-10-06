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
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'لوحة تحكم الطالب',
  description: 'الوصول السريع لمحتواك التعليمي وتصفح الدروس والمناهج',
}

export default async function StudentPage() {
  const { supabase } = await requireRole('student')

  const { count: subjectsCount } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  const statCards = [
    { icon: BookOpen, label: 'المواد الدراسية', value: String(subjectsCount ?? 0) },
    { icon: Bookmark, label: 'الموارد والمقررات', value: 'متاحة' },
    { icon: Users, label: 'الكوادر التعليمية', value: 'معتمدون' },
    { icon: MessageSquare, label: 'المنهج الدراسي', value: 'شامل' },
  ]

  return (
    <div className="container-page py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted mb-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-accent" />
          <span>منهجك الدراسي في لمحة</span>
        </div>
        <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary">
              لوحة الطالب
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              الوصول السريع لمحتواك التعليمي وتصفح الدروس والمناهج المعتمدة
            </p>
          </div>
          <Link
            href="/student/subjects"
            className="btn-primary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5"
          >
            <span>استعراض المقررات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="border border-border-base rounded-lg bg-bg-surface p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-medium text-ink-muted">
                  {card.label}
                </span>
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-bg-alt text-ink-secondary border border-border-subtle">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-[26px] font-bold text-ink-primary leading-none mt-1">
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Editorial Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Subjects Section */}
        <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-9 h-9 rounded-md bg-accent-bg text-accent border border-accent/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-ink-primary">
                  المواد الدراسية
                </h2>
                <p className="text-[11px] text-ink-muted">المناهج والملخصات والدروس</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
              استكشف المقررات التعليمية المعتمدة واطلع على شروحات الدروس، والصور التوضيحية، والملفات المرفقة بصيغة PDF ومقاطع الفيديو التوضيحية.
            </p>
          </div>

          <div className="px-5 sm:px-6 py-3.5 border-t border-border-subtle bg-bg-alt/30 flex items-center justify-between">
            <span className="chip text-[11px]">مقررات معتمدة</span>
            <Link
              href="/student/subjects"
              className="text-xs font-semibold text-accent hover:text-accent-light transition-colors flex items-center gap-1"
            >
              <span>دخول المواد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Profile Section */}
        <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-9 h-9 rounded-md bg-bg-alt text-ink-secondary border border-border-subtle flex items-center justify-center shrink-0">
                <UserCheck className="w-4.5 h-4.5" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-ink-primary">
                  الملف الشخصي
                </h2>
                <p className="text-[11px] text-ink-muted">معلومات الحساب والأمان</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
              يمكنك تحديث بياناتك الشخصية وتغيير كلمة المرور الخاصة بحسابك في منصة مِداد التعليمية ومتابعة حالتك الدراسية.
            </p>
          </div>

          <div className="px-5 sm:px-6 py-3.5 border-t border-border-subtle bg-bg-alt/30 flex items-center justify-between">
            <span className="chip text-[11px]">حساب طالب</span>
            <Link
              href="/student/profile"
              className="text-xs font-semibold text-accent hover:text-accent-light transition-colors flex items-center gap-1"
            >
              <span>إدارة الحساب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}