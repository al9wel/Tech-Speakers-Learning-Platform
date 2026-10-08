import Link from 'next/link'
import { LogoMark } from '@/components/Logo'
import { Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'طلبك قيد المراجعة | مِداد',
  description: 'تم استلام طلب التسجيل بنجاح وهو بانتظار موافقة إدارة المنصة',
}

interface PendingApprovalPageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function PendingApprovalPage({ searchParams }: PendingApprovalPageProps) {
  const params = await searchParams
  const role = params?.role

  const roleLabel =
    role === 'teacher'
      ? 'معلم'
      : role === 'counselor'
      ? 'مستشار نفسي وتربوي'
      : 'كادر تعليمي'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="card p-8 sm:p-10 bg-white shadow-card border border-ink-100/90 text-center relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <LogoMark />
          </div>

          {/* Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center mb-5 shadow-soft">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>طلب حساب {roleLabel} بانتظار الموافقة</span>
          </div>

          {/* Title */}
          <h1 className="font-heading font-extrabold text-2xl text-ink-900 mb-3">
            تم استلام طلب التسجيل بنجاح!
          </h1>

          {/* Description */}
          <p className="text-sm text-ink-600 leading-relaxed mb-6">
            شكراً لانضمامك إلى منصة <strong className="text-ink-900 font-bold">مِداد</strong> التعليمية بصفتك {roleLabel}. تم إرسال بيانات حسابك إلى إدارة المنصة (الأدمن) للمراجعة والاعتماد.
          </p>

          {/* Notice box */}
          <div className="p-4 rounded-2xl bg-cream/50 border border-ink-100 text-right text-xs text-ink-700 space-y-2 mb-8">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
              <span>تم حفظ بياناتك واكتمال مرحلة التقديم بنجاح.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>بمجرد قبول وتفعيل حسابك من قِبل مسؤول النظام، ستتمكن من تسجيل الدخول فوراً عبر بريدك الإلكتروني وكلمة المرور.</span>
            </div>
          </div>

          {/* Action button */}
          <Link
            href="/auth?mode=login"
            className="w-full text-base py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 text-white shadow-soft transition-all duration-200 cursor-pointer"
          >
            <span>العودة لصفحة تسجيل الدخول</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
