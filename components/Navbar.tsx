'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  User as UserIcon,
  LogOut,
  GraduationCap,
  Heart,
  Shield,
  ShieldCheck,
  Loader2,
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
    setIsMobileMenuOpen(false)

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
    setIsMobileMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const currentRoleInfo = userData?.role ? roleLabels[userData.role] : null

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-ink-100/80 shadow-xs">
      <nav className="container-page flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <Logo showTagline={true} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-8 w-44 bg-ink-100/80 rounded-xl animate-pulse" />
          ) : userData ? (
            <>
              {userData.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`btn-ghost text-sm font-medium hover:text-ink-900 ${
                    pathname.startsWith('/admin') && pathname !== '/admin/profile'
                      ? 'bg-ink-100/70 text-ink-900'
                      : ''
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة الإدارة</span>
                </Link>
              )}

              {userData.role === 'teacher' && (
                <Link
                  href="/teacher"
                  className={`btn-ghost text-sm font-medium hover:text-ink-900 ${
                    pathname.startsWith('/teacher') && pathname !== '/teacher/profile'
                      ? 'bg-ink-100/70 text-ink-900'
                      : ''
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>واجهة المعلم</span>
                </Link>
              )}

              {userData.role === 'student' && (
                <Link
                  href="/student"
                  className={`btn-ghost text-sm font-medium hover:text-ink-900 ${
                    pathname.startsWith('/student') && pathname !== '/student/profile'
                      ? 'bg-ink-100/70 text-ink-900'
                      : ''
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>لوحة الطالب</span>
                </Link>
              )}

              {userData.role === 'supervisor' && (
                <Link
                  href="/supervisor"
                  className={`btn-ghost text-sm font-medium hover:text-ink-900 ${
                    pathname.startsWith('/supervisor') && pathname !== '/supervisor/profile'
                      ? 'bg-ink-100/70 text-ink-900'
                      : ''
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة المشرف</span>
                </Link>
              )}

              {userData.role === 'counselor' && (
                <Link
                  href="/counselor"
                  className={`btn-ghost text-sm font-medium hover:text-ink-900 ${
                    pathname.startsWith('/counselor') && pathname !== '/counselor/profile'
                      ? 'bg-ink-100/70 text-ink-900'
                      : ''
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>لوحة المستشار</span>
                </Link>
              )}

              {userData.profilePath && (
                <Link
                  href={userData.profilePath}
                  className="btn-outline text-xs sm:text-sm py-1.5 px-3 bg-white hover:bg-ink-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-ink-600" />
                  <span className="font-semibold text-ink-800 truncate max-w-[120px]">
                    {userData.fullName || userData.email}
                  </span>
                  {currentRoleInfo && (
                    <span className="chip bg-gold/15 text-gold-dark text-[11px] py-0.5 px-2">
                      {currentRoleInfo.label}
                    </span>
                  )}
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700 py-1.5 px-3 cursor-pointer"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isSigningOut ? 'خروج...' : 'تسجيل الخروج'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-outline text-sm">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="btn-gold text-sm font-semibold">
                إنشاء حساب طالب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="md:hidden flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-8 w-16 bg-ink-100 rounded-lg animate-pulse" />
          ) : (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-outline p-2 rounded-xl text-ink-800 hover:bg-ink-100 cursor-pointer"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-cream/98 px-4 py-4 space-y-3 animate-slide-up shadow-card">
          {userData ? (
            <div className="flex flex-col gap-2">
              {/* User Identity Chip */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-ink-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 font-bold flex items-center justify-center text-xs">
                    {(userData.fullName || userData.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-900 truncate max-w-[180px]">
                      {userData.fullName || userData.email}
                    </p>
                    <p className="text-[10px] text-ink-500 truncate max-w-[180px]" dir="ltr">
                      {userData.email}
                    </p>
                  </div>
                </div>
                {currentRoleInfo && (
                  <span className="chip bg-gold/15 text-gold-dark text-xs py-0.5 px-2">
                    {currentRoleInfo.label}
                  </span>
                )}
              </div>

              {/* Navigation Links based on role */}
              {userData.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة الإدارة</span>
                </Link>
              )}

              {userData.role === 'teacher' && (
                <Link
                  href="/teacher"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>واجهة المعلم</span>
                </Link>
              )}

              {userData.role === 'student' && (
                <Link
                  href="/student"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>لوحة الطالب</span>
                </Link>
              )}

              {userData.role === 'supervisor' && (
                <Link
                  href="/supervisor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة المشرف</span>
                </Link>
              )}

              {userData.role === 'counselor' && (
                <Link
                  href="/counselor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <Heart className="w-4 h-4" />
                  <span>لوحة المستشار</span>
                </Link>
              )}

              {userData.profilePath && (
                <Link
                  href={userData.profilePath}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline w-full justify-start text-sm py-2.5 px-3 bg-white"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>الملف الشخصي وإعدادات الحساب</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="btn-outline w-full justify-start text-sm text-red-600 border-red-200 hover:bg-red-50 py-2.5 px-3 cursor-pointer mt-1"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-outline w-full justify-center text-sm py-2.5 bg-white"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-gold w-full justify-center text-sm py-2.5 font-bold"
              >
                إنشاء حساب طالب
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
