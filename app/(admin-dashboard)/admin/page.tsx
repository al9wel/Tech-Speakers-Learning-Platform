import Link from 'next/link'
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminPage() {
    await requireRole('admin')

    return (
        <main className="bg-white text-black min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">You are an Admin</h1>
            <div className="mb-6">
                <Link
                    href="/admin/users"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded hover:bg-blue-700"
                >
                    Manage Users (/admin/users)
                </Link>
            </div>
        </main>
    )
}