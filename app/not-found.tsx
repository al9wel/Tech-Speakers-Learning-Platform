import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة (404)',
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 animate-page">
      <div className="p-8 bg-paper-light shadow-md border border-ink-200/80 rounded-lg max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>

        <h1 className="font-serif font-bold text-5xl text-ink-900 mb-2">
          404
        </h1>

        <h2 className="font-serif font-bold text-xl text-ink-900 mb-3">
          الصفحة غير موجودة
        </h2>

        <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed font-sans">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها إلى عنوان آخر.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md bg-teal hover:bg-teal-dark text-white text-sm font-medium transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
