'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import {
  User as UserIcon,
  LogOut,
  GraduationCap,
  Users,
  Shield,
  ShieldCheck,
  Heart,
  Loader2,
} from 'lucide-react'

const roleLabels: Record<string, { label: string; icon: any }> = {
  student: { label: 'طالب', icon: GraduationCap },
  teacher: { label: 'معلم', icon: Users },
  admin: { label: 'مشرف عام', icon: Shield },
  supervisor: { label: 'مشرف تربوي', icon: ShieldCheck },
  counselor: { label: 'مستشار نفسي', icon: Heart },
}

const rolePaths: Record<string, string> = {
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
  supervisor: '/supervisor',
  counselor: '/counselor',
}

interface UserData {
  email: string
  fullName: string | null
  role: string | null
  profilePath: string | null
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const loadUser = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUserData(null)
        setIsLoaded(true)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      const role = profile?.role || null
      const profilePath =
        role && rolePaths[role] ? `${rolePaths[role]}/profile` : null

      setUserData({
        email: user.email || '',
        fullName: profile?.full_name || null,
        role,
        profilePath,
      })
    } catch {
      // Ignore network errors gracefully
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadUser()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    const handleCustomAuthChange = () => {
      loadUser()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-changed', handleCustomAuthChange)
    }

    return () => {
      subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-changed', handleCustomAuthChange)
      }
    }
  }, [pathname, loadUser])

  async function handleSignOut() {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'))
    }

    setUserData(null)
    setIsSigningOut(false)
    router.push('/auth')
    router.refresh()
  }

  const currentRoleInfo = userData?.role ? roleLabels[userData.role] : null

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-ink-100/80 shadow-xs">
      <nav className="container-page flex items-center justify-between h-16 gap-3">
        {/* RIGHT SIDE in RTL (Start of layout): Logo */}
        <div className="flex items-center gap-2">
          <Logo showTagline={true} />
        </div>

        {/* LEFT SIDE in RTL (End of layout): Student / User Info & Sign Out OR Login Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoaded ? (
            <div className="h-9 w-36 bg-ink-100/80 rounded-xl animate-pulse" />
          ) : userData ? (
            <>
              {userData.profilePath && (
                <Link
                  href={userData.profilePath}
                  className="btn-outline text-xs sm:text-sm py-1.5 px-3 bg-white hover:bg-ink-50 flex items-center gap-2 shadow-2xs"
                  title="عرض الملف الشخصي"
                >
                  <UserIcon className="w-4 h-4 text-ink-600" />
                  <span className="font-bold text-ink-800 truncate max-w-[110px] sm:max-w-[150px]">
                    {userData.fullName || userData.email}
                  </span>
                  {currentRoleInfo && (
                    <span className="chip bg-gold/15 text-gold-dark text-[11px] py-0.5 px-2 font-bold">
                      {currentRoleInfo.label}
                    </span>
                  )}
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="btn-ghost text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 py-1.5 px-2.5 sm:px-3 cursor-pointer flex items-center gap-1.5"
                title="تسجيل الخروج من الحساب"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="hidden sm:inline font-bold">
                  {isSigningOut ? 'خروج...' : 'تسجيل الخروج'}
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gold-dark hover:bg-gold text-white shadow-soft transition cursor-pointer"
            >
              <span>دخول</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
