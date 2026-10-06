import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import {
  Heart,
  MessageCircle,
  Users,
  CheckCircle2,
  ArrowLeft,
  UserCheck,
  MessageSquareText,
  Clock3,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'لوحة تحكم المستشار التربوي',
  description: 'متابعة طلبات الإرشاد واستشارات الطلاب النفسية والتربوية والرد عليها',
}

export default async function CounselorPage() {
  const { user, supabase } = await requireRole('counselor')

  // Real stats
  const { count: totalConsultations } = await supabase
    .from('counseling_messages')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)

  const { count: pendingConsultations } = await supabase
    .from('counseling_messages')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)
    .eq('status', 'pending')

  const { count: answeredConsultations } = await supabase
    .from('counseling_messages')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)
    .eq('status', 'answered')

  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  const statCards = [
    {
      icon: MessageCircle,
      label: 'جلسات واستشارات واردة',
      value: String(totalConsultations || 0),
      color: 'text-teal bg-teal/10',
    },
    {
      icon: Clock3,
      label: 'بانتظار رد المستشار',
      value: String(pendingConsultations || 0),
      color: 'text-amber-800 bg-amber-500/10',
    },
    {
      icon: CheckCircle2,
      label: 'استشارات مكتملة الرد',
      value: String(answeredConsultations || 0),
      color: 'text-emerald-800 bg-emerald-500/10',
    },
    {
      icon: Users,
      label: 'الطلاب المسجلون بالمنصة',
      value: String(totalStudents || 0),
      color: 'text-ink-700 bg-ink-100',
    },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 sm:p-8 mb-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-ink-900">واجهة المستشار النفسي</h1>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">تقديم الدعم النفسي والإرشاد الأكاديمي والتربوي للطلاب</p>
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
        <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 flex flex-col justify-between shadow-xs hover:border-teal/50 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-900">التواصل مع الطلاب</h2>
                <p className="text-xs text-ink-500">الاستماع للطلاب والرد عليهم أو بدء محادثة جديدة</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              استقبل طلبات الاستشارة الخاصة بالطلاب وقدم لهم الدعم التوجيهي والنفسي بسرية وأمان تام، أو ابحث عن أي طالب لمراسلته مباشرة.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-600/20">
              {pendingConsultations || 0} استشارة بانتظار ردك
            </span>
            <Link
              href="/counselor/students"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs"
            >
              <span>إدارة الاستشارات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 flex flex-col justify-between shadow-xs hover:border-ink-300 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink-900">الملف الشخصي للمستشار</h2>
                <p className="text-xs text-ink-500">إدارة معلومات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
              يمكنك تحديث معلوماتك الشخصية وساعات تقديم الاستشارات النفسية والتربوية للطلاب.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-ink-100 text-ink-700">صلاحية مستشار نفسي</span>
            <Link
              href="/counselor/profile"
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