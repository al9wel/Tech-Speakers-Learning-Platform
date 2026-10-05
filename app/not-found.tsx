import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 animate-page">
      <div className="card p-8 bg-white shadow-card border border-ink-100/80 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-100 text-ink-700 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="font-heading font-extrabold text-5xl text-ink-900 mb-2 font-mono">
          404
        </h1>

        <h2 className="font-heading font-bold text-xl text-ink-900 mb-3">
          الصفحة غير موجودة
        </h2>

        <p className="text-sm text-ink-500 mb-6 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها إلى رابط آخر.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
