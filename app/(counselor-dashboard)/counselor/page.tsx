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
      color: 'text-rose-700 bg-rose-50',
    },
    {
      icon: Clock3,
      label: 'بانتظار رد المستشار',
      value: String(pendingConsultations || 0),
      color: 'text-amber-700 bg-amber-50',
    },
    {
      icon: CheckCircle2,
      label: 'استشارات مكتملة الرد',
      value: String(answeredConsultations || 0),
      color: 'text-sage-dark bg-sage-50',
    },
    {
      icon: Users,
      label: 'الطلاب المسجلون بالمنصة',
      value: String(totalStudents || 0),
      color: 'text-gold-dark bg-gold/15',
    },
  ]

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shadow-soft">
          <Heart className="w-5 h-5 text-rose-300" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">واجهة المستشار النفسي</h1>
          <p className="text-sm text-ink-500">تقديم الدعم النفسي والإرشاد الأكاديمي والتربوي للطلاب</p>
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
        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">التواصل مع الطلاب</h2>
                <p className="text-xs text-ink-500">الاستماع للطلاب والرد عليهم أو بدء محادثة جديدة</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              استقبل طلبات الاستشارة الخاصة بالطلاب وقدم لهم الدعم التوجيهي والنفسي بسرية وأمان تام، أو ابحث عن أي طالب لمراسلته مباشرة.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="text-xs text-ink-500 font-bold">
              {pendingConsultations || 0} استشارة بانتظار ردك
            </span>
            <Link
              href="/counselor/students"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span>إدارة الاستشارات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="card p-6 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-ink-900">الملف الشخصي للمستشار</h2>
                <p className="text-xs text-ink-500">إدارة معلومات الحساب وكلمة المرور</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              يمكنك تحديث معلوماتك الشخصية وساعات تقديم الاستشارات النفسية والتربوية للطلاب.
            </p>
          </div>

          <div className="pt-4 border-t border-ink-100/60 flex items-center justify-between">
            <span className="chip bg-rose-50 text-rose-800 text-xs">صلاحية مستشار نفسي</span>
            <Link
              href="/counselor/profile"
              className="btn-secondary text-sm flex items-center gap-2"
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