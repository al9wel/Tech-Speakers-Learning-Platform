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

export const dynamic = 'force-dynamic'

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
      color: 'text-ink-700 bg-ink-100/70',
      href: '/admin/users',
    },
    {
      icon: GraduationCap,
      label: 'الطلاب',
      value: counts.student,
      color: 'text-sage-dark bg-sage-50',
      href: '/admin/students',
    },
    {
      icon: Users,
      label: 'المعلمون',
      value: counts.teacher,
      color: 'text-gold-dark bg-gold/15',
      href: '/admin/teachers',
    },
    {
      icon: Heart,
      label: 'المستشارون',
      value: counts.counselor,
      color: 'text-rose-700 bg-rose-50',
      href: '/admin/counselors',
    },
    {
      icon: ShieldCheck,
      label: 'المشرفون التربويون',
      value: counts.supervisor,
      color: 'text-blue-800 bg-blue-50',
      href: '/admin/supervisors',
    },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shadow-soft">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">لوحة التحكم</h1>
          <p className="text-sm text-ink-500">إدارة المنصة والمحتوى ومجموعات المستخدمين</p>
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
              className="card p-4 sm:p-5 card-hover transition-all block group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-ink-400 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{card.value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{card.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Main Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Card */}
        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-ink-100 text-ink-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">إدارة المستخدمين</h2>
                <p className="text-xs text-ink-500">إضافة وتعديل وحذف الحسابات وتعيين الأدوار</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              تحكم كامل في جميع حسابات المنصة (الطلاب، المعلمون، المشرفون، والمستشارون) مع إمكانية البحث والتصفية والتعديل الفوري.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="text-xs text-ink-500">
              عدد المسجلين: <strong className="text-ink-900">{counts.total} مستخدم</strong>
            </span>
            <Link
              href="/admin/users"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>فتح لوحة المستخدمين</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">الملف الشخصي للمشرف</h2>
                <p className="text-xs text-ink-500">إعدادات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              تعديل بياناتك الشخصية وتغيير كلمة المرور الخاصة بحسابك الإداري بأمان.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-gold/20 text-gold-dark text-xs">
              صلاحية مشرف عام
            </span>
            <Link
              href="/admin/profile"
              className="btn-outline text-sm flex items-center gap-2"
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