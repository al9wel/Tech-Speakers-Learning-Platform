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
  Compass,
} from 'lucide-react'
import { GlobalAiCopilotDrawer } from '@/features/ai/components/GlobalAiCopilotDrawer'



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
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOpenCopilot = () => setIsCopilotOpen(true)
    window.addEventListener('open-global-copilot', handleOpenCopilot)
    return () => window.removeEventListener('open-global-copilot', handleOpenCopilot)
  }, [])


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
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-ink-100/80 shadow-xs">
      <nav className="container-page flex items-center justify-between h-16 gap-3">
        {/* RIGHT SIDE in RTL (Start of layout): Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo showTagline={true} />
        </div>

        {/* LEFT SIDE in RTL (End of layout): User controls */}
        <div className="flex items-center gap-2">
          {/* Platform Guide Button */}
          <button
            type="button"
            onClick={() => setIsCopilotOpen(true)}
            className="btn-outline text-xs py-1 px-2.5 sm:px-3 bg-white hover:bg-ink-50 flex items-center gap-1.5 shadow-2xs rounded-xl font-bold text-ink-800 transition cursor-pointer shrink-0 whitespace-nowrap"
            title="دليل المنصة والوصول السريع"
          >
            <Compass className="w-3.5 h-3.5 text-gold-dark shrink-0" />
            <span className="hidden sm:inline">دليل المنصة</span>
            <span className="sm:hidden">الدليل</span>
          </button>



          {!isLoaded ? (
            <div className="h-8 w-24 sm:w-32 bg-ink-100/80 rounded-xl animate-pulse" />
          ) : userData ? (
            <>
              {/* DESKTOP VIEW (sm:flex): Compact Info & Sign Out */}
              <div className="hidden sm:flex items-center gap-2">
                {userData.profilePath && (
                  <Link
                    href={userData.profilePath}
                    className="btn-outline text-xs py-1 px-2.5 bg-white hover:bg-ink-50 flex items-center gap-1.5 shadow-2xs rounded-xl transition"
                    title="عرض الملف الشخصي"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-ink-500" />
                    <span className="font-bold text-ink-800 truncate max-w-[100px] md:max-w-[130px]">
                      {userData.fullName || userData.email}
                    </span>
                    {currentRoleInfo && (
                      <span className="chip bg-gold/15 text-gold-dark text-[10px] py-0.5 px-1.5 font-bold">
                        {currentRoleInfo.label}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="btn-ghost text-xs text-red-600 hover:bg-red-50 hover:text-red-700 py-1 px-2 cursor-pointer flex items-center gap-1 transition"
                  title="تسجيل الخروج من الحساب"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden md:inline font-bold">
                    {isSigningOut ? 'خروج...' : 'تسجيل الخروج'}
                  </span>
                </button>
              </div>

              {/* MOBILE VIEW (sm:hidden): Hamburger / User Avatar Dropdown */}
              <div className="relative sm:hidden" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl border border-ink-200/80 bg-white shadow-2xs hover:bg-ink-50 transition cursor-pointer"
                  aria-label="قائمة المستخدم"
                  aria-expanded={isMobileMenuOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center font-bold text-xs">
                    {(userData.fullName || userData.email).charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-ink-500 transition-transform ${
                      isMobileMenuOpen ? 'rotate-180 text-gold-dark' : ''
                    }`}
                  />
                </button>

                {/* Mobile Floating Dropdown Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-ink-100 shadow-xl p-3 z-50 animate-scale-in">
                    {/* User Summary Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100/80 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center font-bold text-sm shrink-0">
                        {(userData.fullName || userData.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-xs text-ink-900 truncate">
                          {userData.fullName || 'مستخدم'}
                        </p>
                        <p className="text-[11px] text-ink-400 truncate mb-1">
                          {userData.email}
                        </p>
                        {currentRoleInfo && (
                          <span className="chip bg-gold/15 text-gold-dark text-[10px] py-0 px-1.5 font-bold">
                            {currentRoleInfo.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          setIsCopilotOpen(true)
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-2.5 rounded-xl text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition cursor-pointer text-right"
                      >
                        <Compass className="w-4 h-4 text-gold-dark shrink-0" />
                        <span>دليل المنصة</span>
                      </button>


                      {userData.profilePath && (
                        <Link
                          href={userData.profilePath}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition"
                        >
                          <UserIcon className="w-4 h-4 text-gold-dark shrink-0" />
                          <span>الملف الشخصي</span>
                        </Link>
                      )}
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-2 mt-2 border-t border-ink-100/80">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
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
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gold-dark hover:bg-gold text-white shadow-soft transition cursor-pointer"
            >
              <span>دخول</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Global AI Copilot Slide-over Drawer */}
      <GlobalAiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        userRole={userData?.role}
        userName={userData?.fullName}
      />
    </header>
  )
}

