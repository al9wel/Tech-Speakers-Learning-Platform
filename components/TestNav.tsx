import Link from "next/link";
import { signout } from '@/features/auth/server/actions';
import { createClient } from '@/lib/supabase/server';
import { isAppRole, rolePaths } from '@/lib/auth/roles';

export async function TestNav() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let profilePath: string | null = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile && isAppRole(profile.role)) {
            profilePath = `${rolePaths[profile.role]}/profile`
        }
    }

    return (
        <div className="mt-8 p-4 border-t border-gray-300 bg-white">
            <h3 className="font-bold mb-2 text-black">Test Navigation:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                <Link href="/" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Home</Link>
                <Link href="/admin" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Admin</Link>
                <Link href="/admin/users" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Admin Users</Link>
                <Link href="/counselor" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Counselor</Link>
                <Link href="/student" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Student</Link>
                <Link href="/supervisor" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Supervisor</Link>
                <Link href="/teacher" className="px-4 py-2 bg-gray-200 text-black rounded font-semibold border border-gray-400">Teacher</Link>

                <span className="text-gray-400 mx-2">|</span>

                {profilePath && (
                    <Link href={profilePath} className="px-4 py-2 bg-purple-600 text-white rounded font-semibold">My Profile</Link>
                )}

                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Login</Link>
                <form action={signout} className="m-0 p-0">
                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded font-semibold cursor-pointer">
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
}
