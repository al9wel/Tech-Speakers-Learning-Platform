import { requireRole } from "@/lib/auth/require-role";

export default async function StudentPage() {
    const { user, profile, supabase } = await requireRole('student')

    return (
        <main className="bg-white text-black min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-8">You are a student</h1>
            </main>
    )
}