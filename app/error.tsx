'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log unexpected error without exposing sensitive client data
        console.error('Application error caught by boundary:', error)
    }, [error])

    return (
        <main className="min-h-screen bg-paper-mid text-ink-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-8 bg-paper-light shadow-md border border-ink-200/80 rounded-lg max-w-md w-full text-center">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7" />
                </div>
                <h1 className="font-serif font-bold text-2xl text-ink-900 mb-2">حدث خطأ غير متوقع</h1>
                <p className="text-ink-600 text-xs sm:text-sm mb-6 leading-relaxed font-sans">
                    واجه النظام مشكلة أثناء تحميل الصفحة. يرجى إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal text-white text-sm font-medium rounded-md hover:bg-teal-dark cursor-pointer transition shadow-xs"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة المحاولة</span>
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-ink-700 text-sm font-medium rounded-md border border-ink-200 hover:bg-paper-mid transition shadow-xs"
                    >
                        <Home className="w-4 h-4" />
                        <span>الرئيسية</span>
                    </Link>
                </div>
            </div>
        </main>
    )
}
