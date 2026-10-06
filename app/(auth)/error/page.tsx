import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'خطأ في المصادقة',
}

export default function ErrorPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="card p-8 bg-white shadow-card border border-ink-100/80 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="font-heading font-extrabold text-2xl text-ink-900 mb-2">
          خطأ في المصادقة
        </h1>

        <p className="text-sm text-ink-600 mb-6 leading-relaxed">
          حدث خطأ أثناء محاولة تسجيل الدخول أو التحقق من صلاحيات حسابك. يرجى التأكد من صحة بياناتك أو إعادة المحاولة.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth"
            className="btn-primary text-sm flex items-center justify-center gap-2"
          >
            <span>العودة لصفحة الدخول</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="btn-outline text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}