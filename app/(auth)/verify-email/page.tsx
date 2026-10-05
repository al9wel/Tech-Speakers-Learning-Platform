import Link from 'next/link'
import { MailCheck, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="card p-8 bg-white shadow-card border border-ink-100/80 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-sage-50 text-sage-dark flex items-center justify-center mx-auto mb-4 shadow-soft">
          <MailCheck className="w-8 h-8" />
        </div>

        <h1 className="font-heading font-extrabold text-2xl text-ink-900 mb-2">
          تحقق من بريدك الإلكتروني
        </h1>

        <p className="text-sm text-ink-600 mb-6 leading-relaxed">
          لقد أرسلنا رابط تأكيد إلى بريدك الإلكتروني. يرجى فتح البريد والضغط على الرابط لتفعيل حسابك قبل تسجيل الدخول.
        </p>

        <div className="pt-2">
          <Link
            href="/auth"
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
          >
            <span>العودة لصفحة الدخول</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}