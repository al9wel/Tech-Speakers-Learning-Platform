import { requireRole } from "@/lib/auth/require-role";

export default async function SupervisorPage() {
    const { user, profile, supabase } = await requireRole('supervisor')

    return (
        <main className="bg-white text-black min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-8">You are a Supervisor</h1>
            </main>
    )
}