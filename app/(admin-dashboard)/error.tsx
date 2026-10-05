'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin route error:', error)
    }, [error])

    return (
        <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                !
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard Error</h1>
            <p className="text-gray-600 max-w-md mb-6">
                Failed to load administrative data. This could be due to a connection issue or permission check.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 cursor-pointer transition"
                >
                    Try again
                </button>
                <Link
                    href="/admin"
                    className="px-6 py-3 bg-gray-200 text-black font-bold rounded border border-gray-400 hover:bg-gray-300 transition"
                >
                    Admin Home
                </Link>
            </div>
        </main>
    )
}
