'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  ChevronDown,
  LayoutDashboard,
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  async function handleSignOut() {
    setIsSigningOut(true)
    setIsMobileMenuOpen(false)
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
  const dashboardPath = userData?.role ? rolePaths[userData.role] : '/'

  return (
    <header className="sticky top-0 z-40 bg-bg-surface/95 backdrop-blur border-b border-border-base">
      <nav className="container-page flex items-center justify-between h-14 sm:h-16 gap-3">
        {/* RIGHT SIDE in RTL (Start of layout): Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo showTagline={true} />
        </div>

        {/* LEFT SIDE in RTL (End of layout): User controls */}
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-8 w-24 sm:w-32 bg-bg-alt rounded-md animate-pulse" />
          ) : userData ? (
            <>
              {/* DESKTOP VIEW (sm:flex): Compact Info & Sign Out */}
              <div className="hidden sm:flex items-center gap-2">
                {userData.profilePath && (
                  <Link
                    href={userData.profilePath}
                    className="border border-border-base bg-bg-surface hover:bg-bg-alt text-xs py-1.5 px-3 flex items-center gap-2 rounded-md transition text-ink-primary"
                    title="عرض الملف الشخصي"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-ink-muted" />
                    <span className="font-medium text-ink-primary truncate max-w-[100px] md:max-w-[130px]">
                      {userData.fullName || userData.email}
                    </span>
                    {currentRoleInfo && (
                      <span className="chip bg-bg-alt text-ink-secondary text-[10px] py-0.5 px-1.5 font-medium border border-border-subtle">
                        {currentRoleInfo.label}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="btn-ghost text-xs text-error hover:bg-error-bg/60 py-1.5 px-2.5 rounded-md cursor-pointer flex items-center gap-1 transition"
                  title="تسجيل الخروج من الحساب"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden md:inline font-medium">
                    {isSigningOut ? 'خروج...' : 'خروج'}
                  </span>
                </button>
              </div>

              {/* MOBILE VIEW (sm:hidden): Hamburger / User Avatar Dropdown */}
              <div className="relative sm:hidden" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt transition cursor-pointer"
                  aria-label="قائمة المستخدم"
                  aria-expanded={isMobileMenuOpen}
                >
                  <div className="w-7 h-7 rounded-md bg-accent-bg text-accent flex items-center justify-center font-bold text-xs border border-accent/20">
                    {(userData.fullName || userData.email).charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-ink-muted transition-transform ${
                      isMobileMenuOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {/* Mobile Floating Dropdown Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-lg bg-bg-surface border border-border-base shadow-xl p-3 z-50 animate-fade-in">
                    {/* User Summary Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle mb-2">
                      <div className="w-8 h-8 rounded-md bg-accent-bg text-accent flex items-center justify-center font-bold text-xs shrink-0 border border-accent/20">
                        {(userData.fullName || userData.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-xs text-ink-primary truncate">
                          {userData.fullName || 'مستخدم'}
                        </p>
                        <p className="text-[11px] text-ink-muted truncate mb-1">
                          {userData.email}
                        </p>
                        {currentRoleInfo && (
                          <span className="chip bg-bg-alt text-ink-secondary text-[10px] py-0 px-1.5 font-medium border border-border-subtle">
                            {currentRoleInfo.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-1 text-xs">
                      {userData.profilePath && (
                        <Link
                          href={userData.profilePath}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-bg-alt transition font-medium"
                        >
                          <UserIcon className="w-4 h-4 text-ink-muted" />
                          <span>الملف الشخصي</span>
                        </Link>
                      )}
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-2 mt-2 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-error hover:bg-error-bg/60 transition cursor-pointer"
                      >
                        {isSigningOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span>{isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth"
              className="btn-primary text-xs sm:text-sm py-1.5 px-4 rounded-md"
            >
              <span>دخول</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
