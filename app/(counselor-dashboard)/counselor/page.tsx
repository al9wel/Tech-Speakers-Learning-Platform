import { requireRole } from "@/lib/auth/require-role";

export default async function CounselorPage() {
    const { user, profile, supabase } = await requireRole('counselor')

    return (
        <main className="bg-white text-black min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-8">You are a Counselor</h1>
            </main>
    )
}