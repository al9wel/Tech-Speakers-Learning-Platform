import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  LayoutDashboard,
  Users,
  Shield,
  GraduationCap,
  Heart,
  ShieldCheck,
  ArrowLeft,
  UserCheck,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'لوحة تحكم الإدارة',
  description: 'إحصائيات وإدارة مستخدمي المنصة والصلاحيات',
}

export default async function AdminPage() {
  await requireRole('admin')

  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('role')

  const counts = {
    total: profiles?.length ?? 0,
    student: profiles?.filter((p) => p.role === 'student').length ?? 0,
    teacher: profiles?.filter((p) => p.role === 'teacher').length ?? 0,
    admin: profiles?.filter((p) => p.role === 'admin').length ?? 0,
    supervisor: profiles?.filter((p) => p.role === 'supervisor').length ?? 0,
    counselor: profiles?.filter((p) => p.role === 'counselor').length ?? 0,
  }

  const statCards = [
    {
      icon: Users,
      label: 'إجمالي المستخدمين',
      value: counts.total,
      color: 'text-ink-700 bg-ink-100',
      href: '/admin/users',
    },
    {
      icon: GraduationCap,
      label: 'الطلاب',
      value: counts.student,
      color: 'text-teal bg-teal/10',
      href: '/admin/students',
    },
    {
      icon: Users,
      label: 'المعلمون',
      value: counts.teacher,
      color: 'text-amber-800 bg-amber-500/10',
      href: '/admin/teachers',
    },
    {
      icon: Heart,
      label: 'المستشارون',
      value: counts.counselor,
      color: 'text-teal bg-teal/10',
      href: '/admin/counselors',
    },
    {
      icon: ShieldCheck,
      label: 'المشرفون التربويون',
      value: counts.supervisor,
      color: 'text-ink-700 bg-ink-100',
      href: '/admin/supervisors',
    },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 sm:p-8 mb-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-ink-900">لوحة التحكم الإدارية</h1>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">إدارة المنصة والمحتوى ومجموعات المستخدمين والصلاحيات</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Link
              key={i}
              href={card.href}
              className="rounded-lg border border-ink-200/80 bg-paper-light p-4 sm:p-5 shadow-xs hover:border-teal/50 transition-colors block group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-ink-400 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="font-serif font-bold text-2xl text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-500 mt-1">{card.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Main Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Card */}
        <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 flex flex-col justify-between shadow-xs hover:border-teal/50 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-900">إدارة المستخدمين</h2>
                <p className="text-xs text-ink-500">إضافة وتعديل وحذف الحسابات وتعيين الأدوار</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              تحكم كامل في جميع حسابات المنصة (الطلاب، المعلمون، المشرفون، والمستشارون) مع إمكانية البحث والتصفية والتعديل الفوري.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs text-ink-500">
              عدد المسجلين: <strong className="font-serif font-bold text-ink-900">{counts.total} مستخدم</strong>
            </span>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs"
            >
              <span>فتح لوحة المستخدمين</span>
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
                <p className="text-xs text-ink-500">إعدادات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              تعديل بياناتك الشخصية وتغيير كلمة المرور الخاصة بحسابك الإداري بأمان وسرية.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-800 border border-amber-600/20">
              صلاحية مشرف عام
            </span>
            <Link
              href="/admin/profile"
              className="btn-outline text-xs sm:text-sm py-2 px-4 rounded-md flex items-center gap-2"
            >
              <span>إدارة الحساب الشخصي</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}