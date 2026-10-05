import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/features/auth/server/actions'
import { rolePaths, isAppRole } from '@/lib/auth/roles'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="bg-white text-black min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Yemeni Learning Platform</h1>

        <p className="mb-4">
          Welcome to the educational platform.
        </p>

        <div className="flex gap-4 mb-8">
          <Link href="/login" className="px-6 py-3 text-lg font-bold bg-blue-600 text-white rounded">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-3 text-lg font-bold bg-green-600 text-white rounded">
            Student Sign Up
          </Link>
        </div>

        </main>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const dashboardPath =
    profile && isAppRole(profile.role)
      ? rolePaths[profile.role]
      : null

  return (
    <main className="bg-white text-black min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Yemeni Learning Platform</h1>

      <p className="mb-2">
        You are logged in.
      </p>

      <p className="mb-2">
        Email: {user.email}
      </p>

      <p className="mb-4">
        Role: {profile?.role}
      </p>

      {dashboardPath && (
        <p className="mb-4">
          <Link href={dashboardPath} className="px-6 py-3 text-lg font-bold bg-purple-600 text-white rounded inline-block">
            Go to your dashboard
          </Link>
        </p>
      )}

      <form action={signout} className="mb-8">
        <button type="submit" className="px-6 py-3 text-lg font-bold bg-red-600 text-white rounded cursor-pointer">
          Logout
        </button>
      </form>

      </main>
  )
}